"use client";
import { useState, useEffect, ReactNode, useRef } from 'react';
import Map, {
  Marker,
  NavigationControl,
  Popup,
  ViewState,
  Source,
  Layer,
} from 'react-map-gl';

// Load FlyToInterpolator at runtime to avoid typing/exports mismatch across react-map-gl versions.
// It's accessed only on the client (this component is a client component).
let FlyToInterpolator: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FlyToInterpolator = require('react-map-gl').FlyToInterpolator;
} catch (err) {
  FlyToInterpolator = undefined;
}
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
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState<ViewState & {
    width: number;
    height: number;
    padding: { top: number; right: number; bottom: number; left: number };
  }>({
    longitude: lng,
    latitude: lat,
    zoom: 15,
    bearing: 0,
    pitch: 0,
    // satisfy react-map-gl's ViewState & { width, height } requirement
    width: 0,
    height: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  const [mounted, setMounted] = useState(false);
  
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);
  // Show/hide nearby points of interest
  const [showPlaces, setShowPlaces] = useState<boolean>(true);
  // Routing state for directions fetch
  const [isRouting, setIsRouting] = useState<boolean>(false);

  async function fetchRouteGeoJSON(fromLng: number, fromLat: number, toLng: number, toLat: number) {
    // Use Mapbox Directions API to get a route (geojson)
    const token = typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_DIRECTIONS_TOKEN) ? (process.env.NEXT_PUBLIC_MAPBOX_DIRECTIONS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN) : MAPBOX_TOKEN;
    const profile = 'driving';
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full&access_token=${token}`;
    try {
      setIsRouting(true);
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('Directions API returned', res.status, res.statusText);
        return null;
      }
      const json = await res.json();
      const route = json?.routes?.[0];
      if (!route || !route.geometry) return null;
      return route.geometry; // GeoJSON geometry
    } catch (err) {
      console.error('Error fetching route from Directions API', err);
      return null;
    } finally {
      setIsRouting(false);
    }
  }

  useEffect(() => {
    // Ensure Map is only rendered on the client after mount to avoid
    // mapbox-gl calling map internals before WebGL/context is ready.
    setMounted(true);

    async function loadNearbyPlaces() {
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

  // Listen for external "fly to" and "reset view" requests
  useEffect(() => {
    async function onFlyTo(e: any) {
      const d = e?.detail;
      if (!d || typeof d.latitude !== 'number' || typeof d.longitude !== 'number') return;
      const place: Place = {
        type: d.type || 'restaurant',
        name: d.name || d.id || 'Amenity',
        coordinates: [d.longitude, d.latitude],
        distanceKm: Number(((d.distance ?? 0) as number).toFixed?.(3) ?? 0),
        icon: AMENITY_CATEGORIES.find(c => c.type === d.type)?.icon ?? AMENITY_CATEGORIES[0].icon
      };

      setSelectedPlace(place);

      // Request a routed path from Mapbox Directions API and draw it
      const geom = await fetchRouteGeoJSON(lng, lat, d.longitude, d.latitude);
      if (geom && geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
        setRouteGeoJSON({ type: 'Feature', geometry: geom, properties: {} });

        // Fit map to route bounds if possible
        try {
          const mapboxMap = mapRef.current?.getMap?.();
          if (mapboxMap) {
            const coords = geom.coordinates as [number, number][];
            const lons = coords.map(c => c[0]);
            const lats = coords.map(c => c[1]);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            mapboxMap.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 80, duration: 1200 });
            return;
          }
        } catch (err) {
          // fall back to flyTo
        }
      }

      // fallback: just fly to the destination
      try {
        const mapboxMap = mapRef.current?.getMap?.();
        if (mapboxMap && typeof mapboxMap.flyTo === 'function') {
          mapboxMap.flyTo({ center: [d.longitude, d.latitude], zoom: Math.max(viewState.zoom ?? 15, 16), bearing: 0, pitch: 45, speed: 1.2, curve: 1.4 });
          return;
        }
      } catch (err) {
        // fallback to viewState transition
      }

      setViewState((prev: any) => ({
        ...prev,
        longitude: d.longitude,
        latitude: d.latitude,
        zoom: Math.max(prev?.zoom ?? 15, 16),
        bearing: 0,
        pitch: 45,
        transitionDuration: 1200,
        transitionInterpolator: FlyToInterpolator ? new FlyToInterpolator({ speed: 1.2 }) : undefined
      }));
    }

    function onResetView() {
      setSelectedPlace(null);
      setRouteGeoJSON(null);
      setViewState((prev: any) => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15,
        bearing: 0,
        pitch: 0,
        transitionDuration: 800,
        transitionInterpolator: FlyToInterpolator ? new FlyToInterpolator({ speed: 1.2 }) : undefined
      }));
    }

    window.addEventListener('caimax:flyToAmenity', onFlyTo as EventListener);
    window.addEventListener('caimax:resetMapView', onResetView as EventListener);
    return () => {
      window.removeEventListener('caimax:flyToAmenity', onFlyTo as EventListener);
      window.removeEventListener('caimax:resetMapView', onResetView as EventListener);
    };
  }, []);

    return (
    <Card className="w-full overflow-hidden">
      {/* Map Container */}
      <div className="w-full h-[500px]">
        {mounted ? (
          <Map
            ref={mapRef}
            initialViewState={viewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            onMove={evt => setViewState(prev => ({ ...prev, ...evt.viewState }))}
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

            {/* Selected place popup (heading removed per request) */}
            {selectedPlace && (
              <Popup
                longitude={selectedPlace.coordinates[0]}
                latitude={selectedPlace.coordinates[1]}
                anchor="bottom"
                onClose={() => setSelectedPlace(null)}
                offset={25}
              >
                <div className="p-2">
                  <p className="text-sm text-gray-600">{formatDistance(selectedPlace.distanceKm)}</p>
                </div>
              </Popup>
            )}

            {/* Route line from listing to selected amenity */}
            {routeGeoJSON && (
              <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{ 'line-color': '#2563eb', 'line-width': 4, 'line-opacity': 0.9 }}
                />
              </Source>
            )}

            <NavigationControl position="top-right" />
          </Map>
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}

        {/* Location label removed per request */}
      </div>

      {/* Nearby Places List - clickable to fly the map to the place */}
      <div className="mt-4 p-4">
        {/* Use a fixed height container to prevent layout shift */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[168px]">
          {isLoading ? (
            // Loading skeleton to maintain layout
            <>
              {[1,2,3].map(i => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm animate-pulse">
                  <div className="p-2 bg-gray-100 rounded-lg w-10 h-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-100 rounded w-20"></div>
                      <div className="h-3 bg-gray-100 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {nearbyPlaces.map((place, idx) => (
                <button
                  key={`${place.name}-${idx}`}
                  onClick={async () => {
                    const [lngP, latP] = place.coordinates;
                    setSelectedPlace(place);

                    // Request routed path and draw it
                    const geom = await fetchRouteGeoJSON(lng, lat, lngP, latP);
                    if (geom && geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
                      setRouteGeoJSON({ type: 'Feature', geometry: geom, properties: {} });
                      try {
                        const mapboxMap = mapRef.current?.getMap?.();
                        if (mapboxMap) {
                          const coords = geom.coordinates as [number, number][];
                          const lons = coords.map(c => c[0]);
                          const lats = coords.map(c => c[1]);
                          const minLon = Math.min(...lons);
                          const maxLon = Math.max(...lons);
                          const minLat = Math.min(...lats);
                          const maxLat = Math.max(...lats);
                          mapboxMap.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 80, duration: 1200 });
                          return;
                        }
                      } catch (err) {
                        // fall through to fly
                      }
                    }

                    // fallback: native flyTo or viewState
                    try {
                      const mapboxMap = mapRef.current?.getMap?.();
                      if (mapboxMap && typeof mapboxMap.flyTo === 'function') {
                        mapboxMap.flyTo({ center: [lngP, latP], zoom: Math.max(viewState.zoom ?? 15, 16), bearing: 0, pitch: 45, speed: 1.2, curve: 1.4 });
                        return;
                      }
                    } catch (err) {
                      // fallback
                    }

                    setViewState((prev: any) => ({
                      ...prev,
                      longitude: lngP,
                      latitude: latP,
                      zoom: Math.max(prev?.zoom ?? 15, 16),
                      bearing: 0,
                      pitch: 45,
                      transitionDuration: 1200,
                      transitionInterpolator: FlyToInterpolator ? new FlyToInterpolator({ speed: 1.2 }) : undefined
                    }));
                  }}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm text-left hover:shadow-md"
                >
                  <div className="p-2 bg-blue-50 rounded-lg">{place.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm capitalize">{place.type}</p>
                      <span className="text-xs text-gray-500">{formatDistance(place.distanceKm)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{place.name}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>


      </div>
    </Card>
  );
}