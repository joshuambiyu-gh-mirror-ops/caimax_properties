"use client";

import { useState } from 'react';
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
  const [viewState, setViewState] = useState<ViewStateWithDimensions>({
    longitude: 39.8256,
    latitude: 0.5360,
    zoom: 6,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    width: 800,  // Default width
    height: 180  // Match the container height
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
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
        maximumAge: 0
      }
    );
  };

  const updateLocationFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place,neighborhood&limit=1&radius=50`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Mapbox reverse geocode response:', data);
      
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
    } catch (error) {
      console.error('Location error:', error);
      setError(`Failed to get location details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const parseDMS = (dms: string) => {
    // Match degrees, minutes, seconds with optional decimal and direction
    const pattern = /^(-?\d+)°?(\d+)?'?(\d+(\.\d+)?)?\"?([NSEW])?$/;
    const match = dms.trim().match(pattern);
    
    if (!match) return null;
    
    const [_, degrees, minutes = "0", seconds = "0", , direction] = match;
    let dd = Number(degrees) + Number(minutes)/60 + Number(seconds)/(60*60);
    
    if (direction === 'S' || direction === 'W') {
      dd = -dd;
    }
    
    return dd;
  };

  const parseLocationLink = async () => {
    setLoading(true);
    setError(null);
    setLocation(null); // Clear previous location

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

      // Parse the URL
      let urlToParse = locationLink;
      
      // Handle short URLs and redirects.
      // NOTE: resolving short URLs (maps.app.goo.gl / goo.gl) from the browser often fails due to CORS.
      // Resolve the short URL on the server via an API route to avoid client-side fetch errors.
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
                console.log('Resolved short URL to (server):', urlToParse);
              } else {
                console.warn('Resolve API returned no finalUrl, using original link');
              }

              // If the resolved URL doesn't contain coordinates, try to extract from the HTML snippet
              const coordsInUrl = /@(-?\d+\.\d+),(-?\d+\.\d+)/.test(urlToParse);
              if (!coordsInUrl && bodySnippet) {
                // common patterns in Google Maps pages include @lat,lng and center=lat,lng
                let m = bodySnippet.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (!m) m = bodySnippet.match(/center=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
                if (!m) m = bodySnippet.match(/ll=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);

                if (m) {
                  const lat = parseFloat(m[1]);
                  const lng = parseFloat(m[2]);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    console.log('Found coordinates in resolved HTML snippet:', { lat, lng });
                    await updateLocationFromCoordinates(lat, lng);
                    return;
                  }
                }
              }
            } else {
              console.warn('Resolve API failed to expand short URL', await res.text());
            }
        } catch (error) {
          console.error('Error requesting server to resolve short URL:', error);
          // Continue with original URL if resolving fails
        }
      }

      try {
        const url = new URL(urlToParse);
        console.log('Parsing URL:', url.toString());

        // Parse Google Maps links
        if (url.hostname.includes('google.com/maps') || url.hostname.includes('goo.gl')) {
          const params = url.searchParams;
          let lat: number | null = null;
          let lng: number | null = null;

          // Check URL parameters for coordinates
          for (const [key, value] of params.entries()) {
            // Look for coordinates in any parameter
            if (value?.includes(',')) {
              const coords = value.split(',').map(Number);
              if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                [lat, lng] = coords;
                break;
              }
            }
          }

          // If no coordinates found in parameters, try URL path
          if (!lat || !lng) {
            const urlText = url.toString();
            const coords = urlText.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coords) {
              lat = parseFloat(coords[1]);
              lng = parseFloat(coords[2]);
            }
          }
        }
        // Parse WhatsApp location links
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

        throw new Error('Could not extract location from the link. Please ensure it\'s a valid Google Maps or WhatsApp location link.');
      } catch (error) {
        console.error('Error parsing URL:', error);
        throw new Error('Invalid URL format. Please ensure you\'ve copied the entire link.');
      }
    } catch (error) {
      console.error('Error parsing location:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid location link. Please ensure you\'ve copied the entire link.');
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