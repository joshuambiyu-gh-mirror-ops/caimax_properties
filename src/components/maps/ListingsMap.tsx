"use client";
import { useState } from 'react';
import Map, { Marker, NavigationControl, ViewState } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ribbon } from '@/components/ui/ribbon';
import SearchBar from '../ui/SearchBar';
import type { ListingWithImages } from '@/actions/get-listings';

interface MapProps {
  listings?: ListingWithImages[];
  search: string;
  setSearch: (s: string) => void;
}

export default function ListingsMap({ listings = [], search, setSearch }: MapProps) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 36.8172, // Center on Nairobi
    latitude: -1.2864,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const [selectedTown, setSelectedTown] = useState('Nairobi');
  const towns = [
    { label: 'Nairobi', longitude: 36.8172, latitude: -1.2864, zoom: 10 },
    { label: 'Karen', longitude: 36.7157, latitude: -1.3201, zoom: 12 },
    { label: 'Westlands', longitude: 36.8055, latitude: -1.2648, zoom: 13 },
    { label: 'Kilimani', longitude: 36.7831, latitude: -1.2921, zoom: 13 },
    { label: 'Syokimau', longitude: 36.9586, latitude: -1.3636, zoom: 13 },
    { label: 'Ruiru', longitude: 36.9584, latitude: -1.1454, zoom: 13 },
  ];

  return (
    <div className="space-y-4 mr-4">
      <h1>Listings Map</h1>
      {/* Search bar above ribbon */}
      <div className="mb-2">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <Ribbon
        items={towns.map(town => ({
          label: town.label,
          onClick: () => {
            setViewState({ ...viewState, longitude: town.longitude, latitude: town.latitude, zoom: town.zoom });
            setSelectedTown(town.label);
          }
        }))}
        selected={selectedTown}
      />
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