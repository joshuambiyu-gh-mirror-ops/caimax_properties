"use client";
import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl, ViewState } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { ListingWithImages } from '@/actions/get-listings';
import { townCoordinates, findLocationCoordinates } from '@/lib/townCoordinates';

export interface MapProps {
  listings?: ListingWithImages[];
  search: string;
}

export default function ListingsMap({ listings = [], search }: MapProps) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 36.8172, // Center on Nairobi
    latitude: -1.2864,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  // Pan to selected location when search changes
  useEffect(() => {
    // Always get coordinates, defaulting to Nairobi if no search or "All"
    const coordinates = (!search || search === 'All') 
      ? townCoordinates['Nairobi']
      : findLocationCoordinates(search, listings);

    setViewState(prev => ({
      ...prev,
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
      zoom: coordinates.zoom,
    }));
  }, [search, listings]);

  return (
    <div className="space-y-4 mr-4">
      <div className="w-full h-[400px] relative rounded-[2rem] shadow-lg transition-shadow duration-300 hover:shadow-2xl hover:shadow-red-300/40 overflow-hidden">
        <Map
          mapStyle="mapbox://styles/mapbox/streets-v11"
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken="pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ"
        >
          {listings
            .filter((listing) =>
              typeof listing.longitude === 'number' && typeof listing.latitude === 'number'
            )
            .map((listing) => (
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
