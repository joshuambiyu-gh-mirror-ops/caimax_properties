import { db } from '@/db';

export type AmenityType = 'hospital' | 'restaurant' | 'bus_station' | 'supermarket' | 'gym' | 'school' | 'park' | 'police';

// Map our amenity types to OSM tags
const osmAmenityMapping: Record<AmenityType, string> = {
  hospital: 'amenity=hospital',
  restaurant: 'amenity=restaurant',
  bus_station: 'highway=bus_stop',
  supermarket: 'shop=supermarket',
  gym: 'leisure=fitness_centre',
  school: 'amenity=school',
  park: 'leisure=park',
  police: 'amenity=police'
};

const getAmenityTypes = (propertyType: string): AmenityType[] => {
  return propertyType === "Apartment"
    ? ["hospital", "restaurant", "bus_station", "supermarket", "gym"]
    : ["school", "hospital", "supermarket", "park", "police"];
};

export async function fetchAndStoreAmenities(listingId: string) {
  try {
    console.log('Starting amenity fetch for listing:', listingId);
    
    // Get the listing
    const listing = await db.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw new Error('Listing not found');
    }
    
    console.log('Found listing:', {
      id: listing.id,
      latitude: listing.latitude,
      longitude: listing.longitude,
      propertyType: (listing as any).propertyType
    });

    const propertyType = (listing as any).propertyType ?? 'Apartment';
    const amenityTypes = getAmenityTypes(propertyType);
    console.log('Fetching amenities for property type:', propertyType);
    console.log('Amenity types to fetch:', amenityTypes);
    const amenities: any[] = [];

    // Fetch amenities for each type
    for (const type of amenityTypes) {
      // Create Overpass query for a 5km radius
      const radius = 5000; // 5km in meters
      const query = `
        [out:json][timeout:25];
        (
          node[${osmAmenityMapping[type]}](around:${radius},${listing.latitude},${listing.longitude});
          way[${osmAmenityMapping[type]}](around:${radius},${listing.latitude},${listing.longitude});
          relation[${osmAmenityMapping[type]}](around:${radius},${listing.latitude},${listing.longitude});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${type} amenities:`, response.statusText);
        continue;
      }

      interface OverpassElement {
        type: string;
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags: {
          name?: string;
          'addr:housenumber'?: string;
          'addr:street'?: string;
          [key: string]: string | undefined;
        };
      }

      const data = await response.json();
      const elements = (data.elements as OverpassElement[]).filter(el => 
        el.tags && (el.lat !== undefined || el.center?.lat !== undefined)
      );
      console.log(`Found ${elements.length} ${type} amenities nearby`);

      // Process and store each amenity
      for (const element of elements) {
        const lat = element.lat ?? element.center?.lat;
        const lng = element.lon ?? element.center?.lon;
        
        // Skip if we don't have valid coordinates
        if (lat === undefined || lng === undefined) continue;
        
        // Construct name from available tags
        const name = element.tags.name || 
          (element.tags['addr:housenumber'] && element.tags['addr:street'] 
            ? `${element.tags['addr:housenumber']} ${element.tags['addr:street']}`
            : `${type} #${element.id}`);
        
        // Calculate distance using the Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = ((lat - listing.latitude) * Math.PI) / 180;
        const dLon = ((lng - listing.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((listing.latitude * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Only include amenities within 5km
        if (distance <= 5) {

          const amenity = {
            type,
            name,
            distance: Number(distance.toFixed(2)), // Round to 2 decimal places
            latitude: lat,
            longitude: lng,
            listingId
          };
          console.log('Found amenity:', amenity);
          amenities.push(amenity);
        } // Close the if (distance <= 5) check
      }
    }

    // Delete existing amenities for this listing
    await db.amenities.deleteMany({
      where: { listingId }
    });

    // Store new amenities
    await db.amenities.createMany({
      data: amenities
    });

    // Update the lastAmenityCheck timestamp
    await db.listing.update({
      where: { id: listingId },
      data: ({ lastAmenityCheck: new Date() } as any)
    });

    console.log('Successfully stored all amenities. Total count:', amenities.length);
    return amenities;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    throw error;
  }
}