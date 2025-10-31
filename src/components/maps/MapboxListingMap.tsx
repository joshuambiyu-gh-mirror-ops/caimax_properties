"use client";
import { useState, useEffect, ReactNode, useRef } from 'react';
import type { MapRef } from 'react-map-gl';
import Map, {
  Marker,
  NavigationControl,
  Popup,
  ViewState,
  Source,
  Layer,
} from 'react-map-gl';

import { MapPin, Store, Utensils, Bus, Hospital, Dumbbell } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "../ui/card";

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
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ";

const AMENITY_CATEGORIES = [
  { type: 'hospital', query: 'hospital', icon: <Hospital className="w-6 h-6 text-red-500 hover:text-red-700" />, label: 'Hospital' },
  { type: 'restaurant', query: 'restaurant', icon: <Utensils className="w-6 h-6 text-amber-700 hover:text-amber-800" />, label: 'Restaurant' },
  { type: 'bus', query: 'bus station', icon: <Bus className="w-6 h-6 text-green-600 hover:text-green-700" />, label: 'Bus Station' },
  { type: 'supermarket', query: 'supermarket', icon: <Store className="w-6 h-6 text-blue-500 hover:text-blue-700" />, label: 'Supermarket' },
  { type: 'gym', query: 'gym', icon: <Dumbbell className="w-6 h-6 text-purple-500 hover:text-purple-700" />, label: 'Gym' }
] as const;

// Map DB amenity type strings to our Place.type union
const mapAmenityType = (t: string): Place['type'] => {
  switch (t) {
    case 'bus_station':
      return 'bus';
    case 'hospital':
      return 'hospital';
    case 'restaurant':
      return 'restaurant';
    case 'supermarket':
      return 'supermarket';
    case 'gym':
      return 'gym';
    default:
      return 'restaurant';
  }
};

// Format distance to be more readable
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
};

const fetchNearbyPlaces = async (listingId: string): Promise<Place[]> => {
  try {
    const res = await fetch(`/api/amenities/${listingId}`);
    if (!res.ok) {
      console.error('Failed to fetch amenities from server:', res.statusText);
      return [];
    }
    const json = await res.json();
    interface AmenityResponse {
      type: string;
      name: string;
      longitude: number;
      latitude: number;
      distance?: number;
    }
    const amenities = (json.amenities || []) as Array<AmenityResponse>;

    // Map DB amenities to Place[] shape
    const places: Place[] = amenities.map(a => ({
      type: mapAmenityType(a.type),
      name: a.name,
      coordinates: [a.longitude, a.latitude],
      distanceKm: Number((a.distance ?? 0).toFixed(3)),
      icon: AMENITY_CATEGORIES.find(c => c.query === a.type || c.type === a.type)?.icon ?? AMENITY_CATEGORIES[0].icon
    }));

    return places.sort((x, y) => x.distanceKm - y.distanceKm);
  } catch (error) {
    console.error('Error fetching amenities API:', error);
    return [];
  }
};



export default function MapboxListingMap({ lat, lng, listingId }: MapboxListingMapProps) {
  const mapRef = useRef<MapRef>(null);
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
  interface RouteGeoJSON {
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
    properties: Record<string, unknown>;
  }
  const [routeGeoJSON, setRouteGeoJSON] = useState<RouteGeoJSON | null>(null);
  // Show/hide nearby points of interest
  const showPlaces = true; // Always show places by default
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
    } catch (error) {
      console.error('Error fetching route from Directions API:', error);
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
  }, [lng, lat, showPlaces, listingId]);

  // Listen for external "fly to" and "reset view" requests
  useEffect(() => {
    interface FlyToEventDetail {
      latitude: number;
      longitude: number;
      type?: string;
      name?: string;
      id?: string;
      distance?: number;
    }

    // Re-exporting the custom event type with additional properties
interface FlyToEvent extends CustomEvent<FlyToEventDetail> {
  // Add any custom event properties here if needed in the future
  readonly timeStamp: number;
}

    async function onFlyTo(e: FlyToEvent) {
      const d = e?.detail;
      if (!d || typeof d.latitude !== 'number' || typeof d.longitude !== 'number') return;
      const place: Place = {
        type: (d.type as Place['type']) || 'restaurant',
        name: d.name || d.id || 'Amenity',
        coordinates: [d.longitude, d.latitude],
        distanceKm: Number(((d.distance ?? 0) as number).toFixed?.(3) ?? 0),
        icon: AMENITY_CATEGORIES.find(c => c.type === d.type)?.icon ?? AMENITY_CATEGORIES[0].icon
      };

      setSelectedPlace(place);

      // Request a routed path from Mapbox Directions API and draw it
      const geom = await fetchRouteGeoJSON(lng, lat, d.longitude, d.latitude);
      if (geom && geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
        setRouteGeoJSON({ 
          type: 'Feature', 
          geometry: geom, 
          properties: {
            // Add any relevant properties here
            timestamp: Date.now()
          } 
        });

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
        } catch (error) {
          console.warn('Error fitting bounds:', error);
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
    } catch (error) {
      console.warn('Error during map transition:', error);
      // fallback to viewState transition
    }      setViewState((prev) => ({
        ...prev,
        longitude: d.longitude,
        latitude: d.latitude,
        zoom: Math.max(prev?.zoom ?? 15, 16),
        bearing: 0,
        pitch: 45,
        transitionDuration: 1200
      }));
    }

    function onResetView() {
      setSelectedPlace(null);
      setRouteGeoJSON(null);
      setViewState((prev) => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15,
        bearing: 0,
        pitch: 0,
        transitionDuration: 800
      }));
    }

    window.addEventListener('caimax:flyToAmenity', onFlyTo as unknown as EventListener);
    window.addEventListener('caimax:resetMapView', onResetView as EventListener);
    return () => {
      window.removeEventListener('caimax:flyToAmenity', onFlyTo as unknown as EventListener);
      window.removeEventListener('caimax:resetMapView', onResetView as EventListener);
    };
  }, [lat, lng, viewState.zoom]);

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
                onClick={(e: { originalEvent?: Event }) => {
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
                  onMouseDown={(e) => e.preventDefault()} /* prevent first-click auto-scroll */
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                      e.preventDefault();
                      /* Let onClick handle the action via keyboard activation */
                    }
                  }}
                  onClick={async () => {
                    const [lngP, latP] = place.coordinates;
                    setSelectedPlace(place);

                    // Request routed path and draw it
                    const geom = await fetchRouteGeoJSON(lng, lat, lngP, latP);
                    if (geom && geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
                      setRouteGeoJSON({ 
                        type: 'Feature', 
                        geometry: geom, 
                        properties: {
                          // Add any relevant properties here
                          timestamp: Date.now()
                        } 
                      });
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
                      } catch (error) {
                        console.warn('Error fitting map bounds:', error);
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
    } catch (error) {
      console.warn('Error during flyTo:', error);
      // fallback to basic transition
    }                    setViewState((prev) => ({
                      ...prev,
                      longitude: lngP,
                      latitude: latP,
                      zoom: Math.max(prev?.zoom ?? 15, 16),
                      bearing: 0,
                      pitch: 45,
                      transitionDuration: 1200
                    }));
                  }}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm text-left hover:shadow-md"
                >
                  <div className="p-2 bg-blue-50 rounded-lg">{place.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm capitalize">{place.type}</p>
                      <span className="text-xs text-gray-500">
                        {isRouting ? 'Calculating route...' : formatDistance(place.distanceKm)}
                      </span>
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