"use client";
import { useState, useEffect, ReactNode } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  Popup,
  ViewState,
  MarkerEvent
} from 'react-map-gl';
import { MapPin, Store, Utensils, Bus, Hospital, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface Place {
  type: 'hospital' | 'restaurant' | 'bus' | 'supermarket' | 'gym';
  name: string;
  distanceKm: number;
  coordinates: [number, number];
  icon: ReactNode;
}

interface MapboxListingMapProps {
  lat: number;
  lng: number;
  listingId: string;
  name: string;
  address?: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ";

const AMENITY_CATEGORIES = [
  { type: 'hospital', query: 'hospital', icon: <Hospital className="w-6 h-6 text-red-500 hover:text-red-700" />, label: 'Hospital' },
  { type: 'restaurant', query: 'restaurant', icon: <Utensils className="w-6 h-6 text-amber-700 hover:text-amber-800" />, label: 'Restaurant' },
  { type: 'bus', query: 'bus station', icon: <Bus className="w-6 h-6 text-green-600 hover:text-green-700" />, label: 'Bus Station' },
  { type: 'supermarket', query: 'supermarket', icon: <Store className="w-6 h-6 text-blue-500 hover:text-blue-700" />, label: 'Supermarket' },
  { type: 'gym', query: 'gym', icon: <Dumbbell className="w-6 h-6 text-purple-500 hover:text-purple-700" />, label: 'Gym' }
] as const;

const getDistance = (fromLat: number, fromLng: number, toLat: number, toLng: number): number => {
  // Haversine formula for great-circle distance (returns kilometers)
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(3)); // keep 3 decimals for precision
};

// Format distance to be more readable
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
};

const OSM_TAGS: Record<string, string> = {
  hospital: 'amenity=hospital',
  restaurant: 'amenity=restaurant',
  'bus station': 'highway=bus_stop',
  supermarket: 'shop=supermarket',
  gym: 'leisure=fitness_centre'
};

const fetchNearbyPlaces = async (listingId: string): Promise<Place[]> => {
  try {
    const res = await fetch(`/api/amenities/${listingId}`);
    if (!res.ok) {
      console.error('Failed to fetch amenities from server:', res.statusText);
      return [];
    }
    const json = await res.json();
    const amenities = (json.amenities || []) as Array<any>;

    // Map DB amenities to Place[] shape
    const places: Place[] = amenities.map(a => ({
      type: (a.type === 'bus_station' ? 'bus' : (a.type as any)) as Place['type'],
      name: a.name,
      coordinates: [a.longitude, a.latitude],
      distanceKm: Number((a.distance ?? 0).toFixed(3)),
      icon: AMENITY_CATEGORIES.find(c => c.query === a.type || c.type === a.type)?.icon ?? AMENITY_CATEGORIES[0].icon
    }));

    return places.sort((x, y) => x.distanceKm - y.distanceKm);
  } catch (err) {
    console.error('Error fetching amenities API:', err);
    return [];
  }
};

// Helper: fetch with retries and exponential backoff for 429 Too Many Requests
async function fetchWithRetries(input: RequestInfo, init?: RequestInit, maxRetries = 3): Promise<Response> {
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(input, init);

      if (res.status === 429) {
        // Honor Retry-After if provided
        const retryAfter = res.headers.get('retry-after');
        const waitMs = retryAfter ? Number(retryAfter) * 1000 : Math.pow(2, attempt) * 500 + Math.round(Math.random() * 200);
        console.warn(`Overpass 429 received, attempt ${attempt + 1}/${maxRetries}. Waiting ${waitMs}ms before retry.`);
        if (attempt === maxRetries) return res; // return last response to let caller handle
        await sleep(waitMs);
        continue;
      }

      // For 5xx, optionally retry as well
      if (res.status >= 500 && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt) * 500 + Math.round(Math.random() * 200);
        console.warn(`Overpass server error ${res.status}, attempt ${attempt + 1}/${maxRetries}. Waiting ${waitMs}ms before retry.`);
        await sleep(waitMs);
        continue;
      }

      return res;
    } catch (err) {
      // network error, retry
      if (attempt === maxRetries) throw err;
      const waitMs = Math.pow(2, attempt) * 500 + Math.round(Math.random() * 200);
      console.warn(`Network error, attempt ${attempt + 1}/${maxRetries}. Waiting ${waitMs}ms before retry.`, err);
      await sleep(waitMs);
    }
  }

  // Should never reach here
  throw new Error('fetchWithRetries exhausted retries');
}

export default function MapboxListingMap({ lat, lng, listingId, name, address }: MapboxListingMapProps) {
  const [viewState, setViewState] = useState({
    longitude: lng,
    latitude: lat,
    zoom: 15,
    bearing: 0,
    pitch: 0,
  });
  const [mounted, setMounted] = useState(false);
  
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaces, setShowPlaces] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ensure Map is only rendered on the client after mount to avoid
    // mapbox-gl calling map internals before WebGL/context is ready.
    setMounted(true);

    async function loadNearbyPlaces() {
      setIsLoading(true);
      try {
        const places = await fetchNearbyPlaces(listingId);
        setNearbyPlaces(places);
      } catch (error) {
        console.error('Error loading nearby places:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (showPlaces) {
      loadNearbyPlaces();
    }
  }, [lng, lat, showPlaces]);

  return (
    <Card className="w-full overflow-hidden">
      {/* Map Container */}
      <div className="w-full h-[500px]">
        {mounted ? (
          <Map
            initialViewState={viewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            onMove={evt => setViewState(evt.viewState)}
          >
            {/* Main property marker */}
            <Marker
              longitude={lng}
              latitude={lat}
              anchor="bottom"
            >
              <MapPin className="w-8 h-8 text-red-500 hover:text-red-700 cursor-pointer" />
            </Marker>

            {/* Nearby places markers */}
            {showPlaces && nearbyPlaces.map((place, index) => (
              <Marker
                key={index}
                longitude={place.coordinates[0]}
                latitude={place.coordinates[1]}
                anchor="bottom"
                onClick={(e: any) => {
                  e?.originalEvent?.stopPropagation?.();
                  setSelectedPlace(selectedPlace?.name === place.name ? null : place);
                }}
              >
                {place.icon}
              </Marker>
            ))}

            {/* Selected place popup */}
            {selectedPlace && (
              <Popup
                longitude={selectedPlace.coordinates[0]}
                latitude={selectedPlace.coordinates[1]}
                anchor="bottom"
                onClose={() => setSelectedPlace(null)}
                offset={25}
              >
                <div className="p-2">
                  <h3 className="font-semibold">{selectedPlace.name}</h3>
                  <p className="text-sm text-gray-600">{formatDistance(selectedPlace.distanceKm)}</p>
                </div>
              </Popup>
            )}

            <NavigationControl position="top-right" />
          </Map>
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}

        {/* Location Label */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {address && <p className="text-sm text-gray-600 mt-1">{address}</p>}
        </div>

        {/* Points of Interest Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant={showPlaces ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPlaces(!showPlaces)}
            className="font-medium shadow-lg"
          >
            Points of Interest
          </Button>
        </div>
      </div>

      {/* Nearby Amenities Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm">
        <div className="flex justify-between items-center px-4 py-2">
          {AMENITY_CATEGORIES.map((category, index) => {
            // Hardcoded distances for testing
            const distance = [0.3, 0.5, 0.7, 1.2, 1.5][index];
            
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-all cursor-pointer"
                onClick={() => {}}
              >
                <div className="p-1.5 rounded-md bg-white/80 shadow-sm">
                  {category.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{category.label}</p>
                  <p className="text-xs text-gray-600">{formatDistance(distance)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}