"use client";
import { useState } from 'react';
import Map, { Marker, NavigationControl, ViewState } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -122.4376,
    latitude: 37.7577,
    zoom: 8,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const goToLocation = () => {
    setViewState((prevState) => ({
      ...prevState,
      longitude: -122.4376,
      latitude: 37.7577,
      zoom: 14, // Zooms in closer to the location
    }));
  };

  return (
    <div className="space-y-4">
      <h1>Area Map</h1>
      <Button 
        onClick={goToLocation}
        className="mb-4"
      >
        Go to Location
      </Button>
      <div className="w-1/2 h-[400px] relative">
        <Map
          mapStyle="mapbox://styles/mapbox/streets-v11"
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onLoad={(event) => event.target.flyTo({ center: [viewState.longitude, viewState.latitude], zoom: viewState.zoom, speed: 0.5 })}
          mapboxAccessToken="pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ"
        >
          <Marker 
            longitude={-122.4376} 
            latitude={37.7577}
            anchor="bottom"
          >
            <MapPin className="w-6 h-6 text-red-500" />
          </Marker>
          <NavigationControl position="top-right" />
        </Map>
      </div>
    </div>
  );
}
