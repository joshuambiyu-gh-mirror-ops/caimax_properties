'use client';
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Prevent mapbox from accessing process.env
mapboxgl.accessToken = 'pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ';

export default function MapTestPage() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12', // Using a default style first
            center: [36.8219, -1.2921],
            zoom: 12
        });

        // Cleanup on unmount
        return () => {
            map.current?.remove();
        };
    }, []);

    return (
        <div className="relative w-full h-[calc(100vh-4rem)]">
            <div ref={mapContainer} className="absolute inset-0" />
        </div>
    );
}

