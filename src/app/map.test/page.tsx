"use client";
import { useState } from 'react';
import Map, {Marker, Popup, ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import getCenter from 'geolib/es/getCenter';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -122.4376,
    latitude: 37.7577,
    zoom: 8,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  return (
    <div>
      <h1>Mapbox with Next.js and TypeScript</h1>
      <div style={{ width: '100%', height: '600px' }}>
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          // mapStyle="mapbox://styles/mbiyu/cm7j261lv00nw01s87o2cfs3j"
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken="pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ" 

        />
      </div>
    </div>
  );
}