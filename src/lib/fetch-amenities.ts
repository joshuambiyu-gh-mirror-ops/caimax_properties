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

interface FetchConfig {
  maxRetries?: number;
  initialRadius?: number;
  maxRadius?: number;
  radiusStep?: number;
  batchDelay?: number;
  timeout?: number;
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class OverpassClient {
  private endpoints: string[];
  private currentEndpoint: number;
  private lastRequestTime: number;
  private minRequestInterval: number;

  constructor() {
    this.endpoints = (process.env.OVERPASS_ENDPOINTS?.split(',').map(s => s.trim()).filter(Boolean)) || [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter'
    ];
    this.currentEndpoint = 0;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // Minimum 1 second between requests
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await wait(this.minRequestInterval - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  private rotateEndpoint() {
    this.currentEndpoint = (this.currentEndpoint + 1) % this.endpoints.length;
    return this.endpoints[this.currentEndpoint];
  }

  async fetchAmenities(query: string, maxRetries: number, timeout: number): Promise<any[]> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < maxRetries) {
      await this.enforceRateLimit();
      const endpoint = this.endpoints[this.currentEndpoint];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        console.log(`[Overpass] Attempt ${attempt + 1}/${maxRetries} using ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'CaimaxProperties/1.0' 
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle non-JSON responses early
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('json')) {
          this.rotateEndpoint();
          attempt++;
          await wait(1000 * attempt); // Exponential backoff
          continue;
        }

        if (!response.ok) {
          if (response.status === 429 || response.status >= 500) {
            this.rotateEndpoint();
            attempt++;
            await wait(1000 * attempt); // Exponential backoff
            continue;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.elements) {
          throw new Error('Invalid response format');
        }

        return data.elements.filter((el: any) => 
          el.tags && (el.lat !== undefined || el.center?.lat !== undefined)
        );

      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;
        
        if (error.name === 'AbortError') {
          console.log('[Overpass] Request timeout, rotating endpoint');
          this.rotateEndpoint();
        }
        
        attempt++;
        await wait(1000 * attempt); // Exponential backoff
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}

function buildOverpassQuery(type: AmenityType, lat: number, lon: number, radius: number): string {
  return `[out:json][timeout:25];
    (
      node[${osmAmenityMapping[type]}](around:${radius},${lat},${lon});
      way[${osmAmenityMapping[type]}](around:${radius},${lat},${lon});
      relation[${osmAmenityMapping[type]}](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;`;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Convert to meters
}

export async function fetchNearbyAmenities({
  latitude,
  longitude,
  prisma,
  config = {}
}: {
  latitude: number;
  longitude: number;
  prisma: any;
  config?: FetchConfig;
}) {
  const {
    maxRetries = 3,
    initialRadius = 1000,
    maxRadius = 3000,
    radiusStep = 1000,
    batchDelay = 2000,
    timeout = 30000
  } = config;

  const client = new OverpassClient();
  const propertyType = "Any"; // Default to wider amenity set
  const amenityTypes = getAmenityTypes(propertyType);
  const maxPerType = Number(process.env.OVERPASS_MAX_PER_TYPE ?? '5');
  const amenities: any[] = [];

  for (const type of amenityTypes) {
    let radius = initialRadius;
    let found = false;

    while (radius <= maxRadius && !found) {
      try {
        console.log(`[Amenity] Searching for ${type} within ${radius}m`);
        const query = buildOverpassQuery(type, latitude, longitude, radius);
        const elements = await client.fetchAmenities(query, maxRetries, timeout);

        if (elements.length > 0) {
          const processed = elements
            .map(element => {
              const lat = element.lat ?? element.center?.lat;
              const lon = element.lon ?? element.center?.lon;
              if (!lat || !lon) return null;

              const distance = calculateDistance(latitude, longitude, lat, lon);
              return {
                type,
                name: element.tags?.name || 
                      (element.tags?.['addr:housenumber'] && element.tags?.['addr:street'] 
                       ? `${element.tags['addr:housenumber']} ${element.tags['addr:street']}`
                       : `${type} #${element.id}`),
                distance: Number(distance.toFixed(2)),
                latitude: lat,
                longitude: lon
              };
            })
            .filter((a): a is NonNullable<typeof a> => a !== null && a.distance <= maxRadius)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, maxPerType);

          if (processed.length > 0) {
            amenities.push(...processed);
            found = true;
            console.log(`[Amenity] Found ${processed.length} ${type}s at ${radius}m`);
          }
        }

        if (!found) {
          radius += radiusStep;
          await wait(batchDelay);
        }
      } catch (error) {
        console.error(`[Amenity] Error fetching ${type}:`, error);
        radius += radiusStep;
        await wait(batchDelay);
      }
    }

    if (!found) {
      console.log(`[Amenity] No ${type}s found within ${maxRadius}m`);
    }

    // Small delay between different amenity types
    await wait(batchDelay);
  }

  // Return the results without storing them - the caller can decide what to do
  return amenities;
}

export async function fetchAndStoreAmenities(listingId: string) {
  try {
    console.log('[Storage] Starting amenity fetch for listing:', listingId);
    
    // Get the listing
    const listing = await db.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    console.log('[Storage] Found listing:', {
      id: listing.id,
      latitude: listing.latitude,
      longitude: listing.longitude,
      propertyType: (listing as any).propertyType
    });

    // Fetch amenities
    const amenities = await fetchNearbyAmenities({
      latitude: listing.latitude,
      longitude: listing.longitude,
      prisma: db,
      config: {
        maxRetries: 3,
        initialRadius: 1000,
        maxRadius: 3000,
        radiusStep: 1000,
        batchDelay: 2000,
      }
    });

    // Add listingId to each amenity
    const amenitiesWithListing = amenities.map(amenity => ({
      ...amenity,
      listingId
    }));

    // Start a transaction for atomic update
    console.log('[Storage] Starting database transaction');
    const [deleted, created] = await db.$transaction([
      // Delete existing amenities
      db.amenities.deleteMany({ 
        where: { listingId } 
      }),
      
      // Create new amenities
      db.amenities.createMany({
        data: amenitiesWithListing
      }),

      // Update lastAmenityCheck timestamp
      db.listing.update({
        where: { id: listingId },
        data: { lastAmenityCheck: new Date() } as any
      })
    ]);

    console.log('[Storage] Transaction complete:', {
      deleted: deleted.count,
      created: created.count
    });

    return amenitiesWithListing;
  } catch (error) {
    console.error('[Storage] Error in fetchAndStoreAmenities:', error);
    throw error;
  }
}
