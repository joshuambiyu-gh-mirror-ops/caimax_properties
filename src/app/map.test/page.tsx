// 'use client';
// import React, { useState } from 'react';
// import { Map } from 'react-map-gl';

// export default function MapTestPage() {
//     const [viewport, setViewport] = useState({
//         latitude: 37.7577,
//         longitude: -122.4376,
//         zoom: 11
//     });
    
//     return (
//         <div style={{ width: '100%', height: '100vh' }}> {/* Add container with height */}
//             <Map
//                 mapStyle="mapbox://styles/mbiyu/cm7j261lv00nw01s87o2cfs3j"
//                 mapboxAccessToken="pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ" 
//                 initialViewState={viewport}
//                 style={{ width: '100%', height: '100%' }} // Add dimensions to Map
//             />
//         </div>
//     );
// }


"use client";
import { useState } from 'react';
import Map, { ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken="pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ" 

        />
      </div>
    </div>
  );
}