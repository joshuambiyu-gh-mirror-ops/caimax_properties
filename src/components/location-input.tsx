"use client";

import { useState, useEffect } from 'react';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import Map, { Marker } from 'react-map-gl';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ViewState } from 'react-map-gl';

interface ViewStateWithDimensions extends ViewState {
  width: number;
  height: number;
}

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationInputProps {
  onLocationSelect: (location: LocationData) => void;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ";

export function LocationInput({ onLocationSelect }: LocationInputProps) {
  const [locationLink, setLocationLink] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  // Start with world view (0, 0) instead of hardcoded Nairobi
  const [viewState, setViewState] = useState<ViewStateWithDimensions>({
    longitude: 0,
    latitude: 0,
    zoom: 2,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    width: 800,
    height: 180
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear all stale location data from browser storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any cached location data that might have been saved
      localStorage.removeItem('lastLocation');
      localStorage.removeItem('cachedLocation');
      localStorage.removeItem('userLocation');
      localStorage.removeItem('mapboxLocation');
      sessionStorage.clear();
      console.log('[LocationInput] Cleared all cached location data');
    }
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator?.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    
    // Clear any previous location data
    setLocation(null);
    setLocationLink(''); // Clear location link input
    
    // Reset view to world view while fetching
    setViewState(prev => ({
      ...prev,
      longitude: 0,
      latitude: 0,
      zoom: 2
    }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('[LocationInput] Got fresh geolocation:', { latitude, longitude });
          await updateLocationFromCoordinates(latitude, longitude);
        } catch (error) {
          console.error('Location error:', error);
          setError(`Failed to get location details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to get your location. ';
        if (error instanceof GeolocationPositionError) {
          switch(error.code) {
            case GeolocationPositionError.PERMISSION_DENIED:
              errorMessage += 'Please enable location access in your browser settings.';
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case GeolocationPositionError.TIMEOUT:
              errorMessage += 'The request to get location timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
        } else {
          errorMessage += 'An unexpected error occurred.';
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh geolocation, don't use cached positions
      }
    );
  };

  const updateLocationFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Add cache-busting parameter to avoid stale Mapbox responses
      const timestamp = Date.now();
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place,neighborhood&limit=1&radius=50&t=${timestamp}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[LocationInput] Mapbox reverse geocode response:', data);
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No location data found');
      }

      const address = data.features[0]?.place_name || '';

      const locationData: LocationData = {
        address,
        latitude: lat,
        longitude: lng
      };

      setLocation(locationData);
      setViewState(prev => ({ ...prev, longitude: lng, latitude: lat, zoom: 16 }));
      onLocationSelect(locationData);
      console.log('[LocationInput] Location selected:', locationData);
    } catch (error) {
      console.error('Location error:', error);
      setError(`Failed to get location details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const parseDMS = (dms: string) => {
    const pattern = /^(-?\d+)°?(\d+)?'?(\d+(\.\d+)?)?\"?([NSEW])?$/;
    const match = dms.trim().match(pattern);
    
    if (!match) return null;
    
    const [, degrees, minutes = "0", seconds = "0", , direction] = match;
    let dd = Number(degrees) + Number(minutes)/60 + Number(seconds)/(60*60);
    
    if (direction === 'S' || direction === 'W') {
      dd = -dd;
    }
    
    return dd;
  };

  const parseLocationLink = async () => {
    setLoading(true);
    setError(null);
    setLocation(null);

    try {
      // First, try to extract DMS coordinates
      const dmsPattern = /([-+]?\d+°\d+'[\d.]+\"[NS])\s*([-+]?\d+°\d+'[\d.]+\"[EW])/;
      const dmsMatch = locationLink.match(dmsPattern);
      if (dmsMatch) {
        const lat = parseDMS(dmsMatch[1]);
        const lng = parseDMS(dmsMatch[2]);
        if (lat !== null && lng !== null) {
          await updateLocationFromCoordinates(lat, lng);
          return;
        }
      }

      // Try to extract decimal coordinates
      const coordsRegex = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/;
      const coordsMatch = locationLink.match(coordsRegex);
      
      if (coordsMatch) {
        const [lat, lng] = coordsMatch[0].split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          await updateLocationFromCoordinates(lat, lng);
          return;
        }
      }

      let urlToParse = locationLink;
      
      if (locationLink.includes('goo.gl') || locationLink.includes('maps.app.goo.gl')) {
        try {
          const res = await fetch('/api/resolve-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: locationLink })
          });

          if (res.ok) {
              const json = await res.json();
              const srvFinal = json?.finalUrl;
              const bodySnippet: string | undefined = json?.bodySnippet;

              if (srvFinal) {
                urlToParse = srvFinal;
                console.log('[LocationInput] Resolved short URL to:', urlToParse);
              }

              const coordsInUrl = /@(-?\d+\.\d+),(-?\d+\.\d+)/.test(urlToParse);
              if (!coordsInUrl && bodySnippet) {
                let m = bodySnippet.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (!m) m = bodySnippet.match(/center=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
                if (!m) m = bodySnippet.match(/ll=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);

                if (m) {
                  const lat = parseFloat(m[1]);
                  const lng = parseFloat(m[2]);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    console.log('[LocationInput] Found coordinates in resolved HTML:', { lat, lng });
                    await updateLocationFromCoordinates(lat, lng);
                    return;
                  }
                }
              }
            } else {
              console.warn('[LocationInput] Resolve API failed:', await res.text());
            }
        } catch (error) {
          console.error('[LocationInput] Error resolving short URL:', error);
        }
      }

      try {
        const url = new URL(urlToParse);
        console.log('[LocationInput] Parsing URL:', url.toString());

        if (url.hostname.includes('google.com/maps') || url.hostname.includes('goo.gl')) {
          const params = url.searchParams;
          let lat: number | null = null;
          let lng: number | null = null;

          for (const [, value] of params.entries()) {
            if (value?.includes(',')) {
              const coords = value.split(',').map(Number);
              if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                [lat, lng] = coords;
                break;
              }
            }
          }

          if (!lat || !lng) {
            const urlText = url.toString();
            const coords = urlText.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coords) {
              lat = parseFloat(coords[1]);
              lng = parseFloat(coords[2]);
            }
          }
        }
        else if (url.hostname.includes('maps.google.com')) {
          const params = url.searchParams;
          const q = params.get('q');
          if (q?.includes(',')) {
            const [lat, lng] = q.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              await updateLocationFromCoordinates(lat, lng);
              return;
            }
          }
        }

        throw new Error('Could not extract location from the link.');
      } catch (error) {
        console.error('[LocationInput] Error parsing URL:', error);
        throw new Error('Invalid URL format. Please ensure you\'ve copied the entire link.');
      }
    } catch (error) {
      console.error('[LocationInput] Error parsing location:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid location link.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 min-w-[180px]"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Use Current Location
            </>
          )}
        </Button>
        
        <div className="flex-1">
          <Label htmlFor="locationLink">Or paste a location link</Label>
          <div className="flex gap-2">
            <Input
              id="locationLink"
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              placeholder="Paste Google Maps or WhatsApp location link"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={parseLocationLink}
              disabled={!locationLink || loading}
              variant="outline"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className={`space-y-2 transition-all duration-300 ${location ? 'opacity-100' : 'opacity-50'}`}>
        <div className="h-[180px] rounded-lg overflow-hidden border shadow-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-sm text-gray-600">Getting precise location...</span>
              </div>
            </div>
          )}
          <Map
            viewState={viewState}
            onMove={(evt) => setViewState(prev => ({ ...prev, ...evt.viewState }))}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            interactive={false}
            scrollZoom={false}
          >
            {location && (
              <Marker
                longitude={location.longitude}
                latitude={location.latitude}
                anchor="bottom"
              >
                <MapPin className="w-6 h-6 text-red-500" />
              </Marker>
            )}
          </Map>
        </div>
        
        {location ? (
          <div className="bg-white px-3 py-2 rounded-lg text-sm text-gray-600">
            {location.address}
          </div>
        ) : (
          <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
            <p className="text-sm text-gray-500">
              Use the options above to select a location
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
