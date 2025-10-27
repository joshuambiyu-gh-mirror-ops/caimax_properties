"use client";
import { useEffect, useRef } from "react";

interface ListingMapProps {
  lat: number;
  lng: number;
  name?: string;
}

export default function ListingMap({ lat, lng, name }: ListingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    // You can replace this with your preferred map library (e.g., Mapbox, Leaflet, Google Maps)
    // For demonstration, we'll just show a placeholder
    mapRef.current.innerHTML = `<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border-radius:12px;'>Map for ${name || "Listing"} [${lat}, ${lng}]</div>`;
  }, [lat, lng, name]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "300px", borderRadius: "12px", overflow: "hidden" }} />
  );
}
