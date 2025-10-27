"use client";
import { useState } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  Popup, 
  ViewState
} from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "./card";

// Types for nearby places
interface Place {
  type: string;
  name: string;
  distance: number;
  coordinates: [number, number];
}

// Custom property boundary style
const propertyBoundaryLayer = {
  id: 'property-boundary',
  type: 'fill',
  paint: {
    'fill-color': '#ff0000',
    'fill-opacity': 0.1,
    'fill-outline-color': '#ff0000'
  }
} as const;

// Mock nearby places (in real app, this would come from an API)
const mockNearbyPlaces: Place[] = [
  { type: 'school', name: 'Local School', distance: 0.5, coordinates: [36.8172, -1.2864] },
  { type: 'coffee', name: 'Coffee Shop', distance: 0.2, coordinates: [36.8170, -1.2862] },
  { type: 'transport', name: 'Bus Station', distance: 0.3, coordinates: [36.8175, -1.2866] },
  { type: 'medical', name: 'Medical Center', distance: 0.7, coordinates: [36.8168, -1.2860] },
];

const getPlaceIcon = (type: string) => {
  switch (type) {
    case 'school': return <School className="w-5 h-5 text-blue-500" />;
    case 'coffee': return <Coffee className="w-5 h-5 text-brown-500" />;
    case 'transport': return <Bus className="w-5 h-5 text-green-500" />;
    case 'medical': return <Hospital className="w-5 h-5 text-red-500" />;
    default: return <MapPin className="w-5 h-5 text-purple-500" />;
  }
};

interface DetailListingMapProps {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export default function DetailListingMap({ 
  lat, 
  lng, 
  name,
  address 
}: DetailListingMapProps) {
  const position: LatLngExpression = [lat, lng];

  useEffect(() => {
    // This is needed to fix the missing marker icon issue in Next.js
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
      iconUrl: require('leaflet/dist/images/marker-icon.png').default,
      shadowUrl: require('leaflet/dist/images/marker-shadow.png').default
    });
  }, []);

  return (
    <Card className="w-full overflow-hidden">
      <div className="w-full h-[400px] relative">
        <MapContainer
          center={position}
          zoom={16}
          className="w-full h-full z-0"
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{name}</h3>
                {address && <p className="text-xs text-gray-600 mt-1">{address}</p>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </Card>
  );
}