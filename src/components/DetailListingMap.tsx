"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { Card } from "./ui/card";

// Custom marker icon
const customIcon = new Icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DetailListingMapProps {
  lat: number;
  lng: number;
  name: string;
  price?: string;
  address?: string;
}

export default function DetailListingMap({ 
  lat, 
  lng, 
  name,
  price,
  address 
}: DetailListingMapProps) {
  return (
    <Card className="w-full overflow-hidden">
      <div className="w-full h-[400px] relative">
        <MapContainer
          center={[lat, lng]}
          zoom={16}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="p-2">
                <h3 className="font-semibold">{name}</h3>
                {price && <p className="text-sm text-blue-600">{price}</p>}
                {address && <p className="text-xs text-gray-600 mt-1">{address}</p>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </Card>
  );
}