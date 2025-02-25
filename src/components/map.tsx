// 'use client';
// import React, { useState } from 'react'
// // import ReactMapGL from 'react-map-gl';
// import { Map } from 'react-map-gl';


// export default function Map() {
//     const [viewport, setViewport] = useState({
//         width: '100%',
//         height: '100%',
//         latitude: 37.7577,
//         longitude: -122.4376,
//         zoom: 11
//     });
//   return (
//     <ReactMapGL
//         mapStyle={process.env.MAP_STYLE}
//         mapboxApiAccessToken={process.env.MAPBOX_KEY} 
//         {...viewport}  
//     >

//     </ReactMapGL>
    
//   )
// }


'use client';
import React, { useState } from 'react';
import { Map } from 'react-map-gl';

export default function MapComponent() {
    const [viewport, setViewport] = useState({
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 11
    });

    return (
        <Map
            // mapStyle={process.env.MAP_STYLE}
            mapStyle="mapbox://styles/mbiyu/cm7j261lv00nw01s87o2cfs3j"
            // mapboxAccessToken={process.env.MAPBOX_KEY}
            mapboxAccessToken="pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ" 
            initialViewState={viewport}
            
        />
    );
}
