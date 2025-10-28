"use client";
import { useState, useEffect, ReactNode } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  Popup,
  ViewState,
  MarkerEvent
} from 'react-map-gl';
import { MapPin, School, Coffee, Bus, Hospital } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "./card";
import { Button } from "./button";

interface Place {
  type: 'school' | 'coffee' | 'bus' | 'medical';
  name: string;
  distanceKm: number;
  coordinates: [number, number];
  icon: ReactNode;
}

interface MapboxListingMapProps {
  lat: number;
  lng: number;
  listingId?: string;
  name: string;
  address?: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ";

const getDistance = (fromLat: number, fromLng: number, toLat: number, toLng: number): number => {
  // Simple Euclidean distance calculation (suitable for small distances)
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  
  // Use a simpler distance calculation suitable for nearby points
  const a = dLat * dLat + Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * dLng * dLng;
  return Number((R * Math.sqrt(a)).toFixed(2));
};

// Format distance to be more readable
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
};

const fetchNearbyPlaces = async (centerLng: number, centerLat: number, listingId?: string): Promise<Place[]> => {
  const categories = [
    { type: 'school', query: 'school', icon: <School className="w-6 h-6 text-blue-500 hover:text-blue-700" /> },
    { type: 'coffee', query: 'cafe', icon: <Coffee className="w-6 h-6 text-amber-700 hover:text-amber-800" /> },
    { type: 'bus', query: 'bus_station', icon: <Bus className="w-6 h-6 text-green-600 hover:text-green-700" /> },
    { type: 'medical', query: 'hospital', icon: <Hospital className="w-6 h-6 text-red-500 hover:text-red-700" /> }
  ];

  const places: Place[] = [];

  // If a listingId is provided, prefer server-side stored amenities
  if (listingId) {
    try {
      const res = await fetch(`/api/amenities/${listingId}`);
      if (!res.ok) {
        console.error('Failed to fetch amenities from server:', res.statusText);
        return [];
      }
      const json = await res.json();
      const amenities = (json.amenities || []) as Array<any>;
      return amenities.map(a => ({
        type: (a.type === 'bus_station' ? 'bus' : (a.type as any)) as Place['type'],
        name: a.name,
        coordinates: [Number(a.longitude), Number(a.latitude)] as [number, number],
        distanceKm: Number((a.distance ?? 0).toFixed(3)),
        icon: categories.find(c => c.query === a.type || c.type === a.type)?.icon ?? categories[0].icon
      })).sort((x, y) => x.distanceKm - y.distanceKm);
    } catch (err) {
      console.error('Error fetching amenities API:', err);
      return [];
    }
  }

  for (const category of categories) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${category.query}.json?proximity=${centerLng},${centerLat}&limit=2&types=poi&access_token=${MAPBOX_TOKEN}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      data.features.forEach((feature: any) => {
        const [lng, lat] = feature.center;
        places.push({
          type: category.type as Place['type'],
          name: feature.text,
          coordinates: [lng, lat],
          distanceKm: getDistance(centerLat, centerLng, lat, lng),
          icon: category.icon
        });
      });
    } catch (error) {
      console.error(`Error fetching ${category.type} places:`, error);
    }
  }

  return places.sort((a, b) => a.distanceKm - b.distanceKm);
};

export default function MapboxListingMap({ lat, lng, name, address }: MapboxListingMapProps) {
  const [viewState, setViewState] = useState<Omit<ViewState, 'padding'> & { padding: { top: number; bottom: number; left: number; right: number } }>({
    longitude: lng,
    latitude: lat,
    zoom: 17, // Increased zoom level for better property view
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaces, setShowPlaces] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadNearbyPlaces() {
      setIsLoading(true);
      try {
        const places = await fetchNearbyPlaces(lng, lat);
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
    <Card className="w-full overflow-hidden flex flex-col">
      <div className="relative flex-none">
        {/* Points-of-interest toggle removed per request */}

        <div className="w-full h-[400px]">
          <Map
            mapStyle="mapbox://styles/mapbox/light-v11"
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {/* Main property marker */}
            <Marker
              longitude={lng}
              latitude={lat}
              anchor="bottom"
            >
              <MapPin className="w-8 h-8 text-red-500 hover:text-red-700 cursor-pointer" />
              <Popup
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                closeButton={false}
                closeOnClick={false}
                offset={25}
              >
                <div className="p-2">
                  <h3 className="font-semibold">{name}</h3>
                </div>
              </Popup>
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
        </div>
      </div>

      {/* Nearby Places List */}
      {showPlaces && (
        <div className="flex-none border-t">
          <div className="p-6">
            <h3 className="font-semibold mb-4 text-lg">Nearby Places</h3>
            <div className="grid grid-cols-2 gap-6">
              {nearbyPlaces.map((place, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                    selectedPlace?.name === place.name ? 'bg-blue-50' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedPlace(selectedPlace?.name === place.name ? null : place)}
                >
                  <div className="flex-shrink-0">
                    {place.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{place.name}</p>
                    <p className="text-xs text-gray-500">{formatDistance(place.distanceKm)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}