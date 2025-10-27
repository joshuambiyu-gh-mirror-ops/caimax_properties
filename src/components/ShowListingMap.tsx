
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ShowListingMapProps {
  lat: number;
  lng: number;
  name?: string;
}

export default function ShowListingMap({ lat, lng, name }: ShowListingMapProps) {
  return (
    <div style={{ width: "100%", height: "300px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ width: "100%", height: "100%", borderRadius: "12px" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            {name || "Listing"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
