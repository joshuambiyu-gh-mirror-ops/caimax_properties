import { db } from '@/db';

const AMENITIES = ["hospital", "school", "supermarket", "restaurant", "police"];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function calculateAndStoreAmenities(listingId: string, latitude: number, longitude: number) {
  console.log('🔍 Starting amenity calculation for listing:', listingId);
  console.log('📍 Location:', latitude, longitude);

  const radius = 2000; // 2km in meters
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const amenities = [];

  for (const type of AMENITIES) {
    console.log('\n🔎 Searching for amenity type:', type);
    
    const query = `[out:json];(node["amenity"="${type}"](around:${radius},${latitude},${longitude}););out;`;
    console.log('📤 Sending Overpass query:', query);

    try {
      const res = await fetch(overpassUrl, {
        method: "POST",
        body: query,
      });

      if (!res.ok) {
        console.error('❌ Overpass API error:', res.status, res.statusText);
        continue;
      }

      const data = await res.json();
      console.log('✅ Received', data.elements?.length || 0, 'results for', type);
      
      // Map and sort all results
      const places = data.elements
        ?.map((el: any) => {
          const distance = Number(getDistance(latitude, longitude, el.lat, el.lon).toFixed(2));
          console.log('📍 Found:', el.tags?.name || 'Unknown', '-', distance, 'km away');
          return {
            name: el.tags?.name || "Unknown",
            type,
            distance,
            latitude: el.lat,
            longitude: el.lon,
            listingId
          };
        })
        .sort((a: any, b: any) => a.distance - b.distance);

      // Get only the closest one
      if (places?.[0]) {
        console.log('✨ Selected closest:', places[0].name, 'at', places[0].distance, 'km');
        amenities.push(places[0]);
      }
    } catch (error) {
      console.error('❌ Error fetching', type + ':', error);
      continue;
    }
  }

  if (amenities.length > 0) {
    console.log('\n💾 Storing', amenities.length, 'amenities in database...');
    try {
      await db.amenities.createMany({
        data: amenities
      });
      console.log('✅ Successfully stored all amenities');
    } catch (error) {
      console.error('❌ Database storage error:', error);
      throw error;
    }
  }

  return amenities;
}

// Reduce an array of amenity records (from DB) to the nearest one per `type`.
export function getNearestPerType(amenitiesArray: Array<any>) {
  if (!Array.isArray(amenitiesArray)) return [];

  const map = new Map<string, any>();

  for (const a of amenitiesArray) {
    if (!a || !a.type) continue;
    const existing = map.get(a.type);
    // ensure numeric distance (stored in km) — convert to meters for display later if needed
    const dist = Number(a.distance) ?? Infinity;
    if (!existing || dist < Number(existing.distance)) {
      map.set(a.type, a);
    }
  }

  // return as array sorted by distance ascending
  return Array.from(map.values()).sort((x: any, y: any) => Number(x.distance) - Number(y.distance));
}