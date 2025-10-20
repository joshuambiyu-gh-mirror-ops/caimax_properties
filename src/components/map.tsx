"use client";
import { useState } from 'react';
import Map, { Marker, NavigationControl, ViewState } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import type { ListingWithImages } from '@/actions/get-listings';

interface MapProps {
  listings?: ListingWithImages[];
}

export default function ListingsMap({ listings = [] }: MapProps) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 36.8172, // Center on Nairobi
    latitude: -1.2864,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const goToNairobi = () => {
    setViewState((prevState) => ({
      ...prevState,
      longitude: 36.8172,
      latitude: -1.2864,
      zoom: 10,
    }));
  };

  return (
    <div className="space-y-4">
      <h1>Listings Map</h1>
      <Button 
        onClick={goToNairobi}
        className="mb-4"
      >
        Go to Nairobi
      </Button>
      <div className="w-full h-[400px] relative">
        <Map
          mapStyle="mapbox://styles/mapbox/streets-v11"
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken="pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ"
        >
          {listings.map((listing) => (
            <Marker 
              key={listing.id}
              longitude={listing.longitude} 
              latitude={listing.latitude}
              anchor="bottom"
            >
              <MapPin className="w-6 h-6 text-red-500 hover:text-red-700 cursor-pointer" />
            </Marker>
          ))}
          <NavigationControl position="top-right" />
        </Map>
      </div>
    </div>
  );
}
