"use client";
import { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { MapPin, Link as LinkIcon } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationInputProps {
  onLocationSelect: (location: { 
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ";

export function LocationInput({ onLocationSelect }: LocationInputProps) {
  const [locationLink, setLocationLink] = useState('');
  const [location, setLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [viewState, setViewState] = useState<any>({
    longitude: 39.8256,
    latitude: 0.5360,
    zoom: 6,
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
          const { latitude, longitude, accuracy } = position.coords;
          console.log('Got coordinates from browser geolocation:', { latitude, longitude, accuracy });
          
          // Reverse geocode to get address with more precise parameters
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood,address&limit=1&language=en&fuzzyMatch=false`
          );
          
          if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Mapbox reverse geocode response features:', data.features && data.features.length ? data.features[0] : null);
          
          if (!data.features || data.features.length === 0) {
            throw new Error('No location data found');
          }
          
          const address = data.features[0]?.place_name || '';
          
          const locationData = {
            address,
            latitude,
            longitude
          };
          
          console.log('Setting location:', locationData);
          setLocation(locationData);
          // update map view to selected location
          setViewState({ longitude: longitude, latitude: latitude, zoom: 16 });
          onLocationSelect(locationData);
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
      console.log('Mapbox reverse geocode for coordinates:', { lat, lng, feature: data.features && data.features.length ? data.features[0] : null });
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No location data found');
      }

      const address = data.features[0]?.place_name || '';

      const locationData = {
        address,
        latitude: lat,
        longitude: lng
      };

      setLocation(locationData);
      setViewState({ longitude: lng, latitude: lat, zoom: 16 });
      onLocationSelect(locationData);
    } catch (error) {
      console.error('Location error:', error);
      setError(`Failed to get location details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const parseLocationLink = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, try to extract coordinates from the text
      const coordsRegex = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/;
      const coordsMatch = locationLink.match(coordsRegex);
      
      if (coordsMatch) {
        const [lat, lng] = coordsMatch[0].split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          await updateLocationFromCoordinates(lat, lng);
          return;
        }
      }

      let lat: number | null = null;
      let lng: number | null = null;

      // Parse the URL
      let urlToParse = locationLink;
      
      // Handle short URLs first
      if (locationLink.includes('goo.gl/maps')) {
        const response = await fetch(locationLink);
        urlToParse = response.url;
      }

      const url = new URL(urlToParse);

      // Parse Google Maps links
      if (url.hostname.includes('google.com/maps') || url.hostname.includes('goo.gl')) {
        // Try different Google Maps formats
        const params = url.searchParams;
        // Format: ?q=lat,lng
        const query = params.get('q');
        if (query?.includes(',')) {
          [lat, lng] = query.split(',').map(Number);
        }
        // Format: /@lat,lng
        const path = url.pathname;
        if (path.includes('/@')) {
          const coords = path.split('/@')[1].split(',');
          lat = parseFloat(coords[0]);
          lng = parseFloat(coords[1]);
        }
        // Format: ?ll=lat,lng
        const ll = params.get('ll');
        if (ll?.includes(',')) {
          [lat, lng] = ll.split(',').map(Number);
        }
      }
      // Parse WhatsApp location links
      else if (url.hostname.includes('maps.google.com')) {
        const params = url.searchParams;
        const q = params.get('q');
        if (q?.includes(',')) {
          [lat, lng] = q.split(',').map(Number);
        }
      }

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        // Reverse geocode to get address
        console.log('Parsed coordinates from link:', { lat, lng });
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();
        console.log('Mapbox reverse geocode for parsed link:', data.features && data.features.length ? data.features[0] : null);
        const address = data.features[0]?.place_name || '';
        
        const locationData = {
          address,
          latitude: lat,
          longitude: lng
        };
        
        setLocation(locationData);
        onLocationSelect(locationData);
      } else {
        setError('Could not extract location from the link. Please ensure it\'s a valid Google Maps or WhatsApp location link.');
      }
    } catch (error) {
      setError('Invalid location link. Please ensure you\'ve copied the entire link.');
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
            // use viewState so the map recenters when user picks current location
            viewState={viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            interactive={false}
            scrollZoom={false}
          >
            {/* Removed NavigationControl since it's just a preview */}
            
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