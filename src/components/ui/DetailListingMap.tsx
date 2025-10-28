"use client";

import { useState } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  Popup,
  ViewState
} from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "./card";

interface DetailListingMapProps {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibWJpeXUiLCJhIjoiY203aXZ0cGQxMDBsdzJqc2EwdXB6ZngxciJ9.tY4trIwdOSdm1_Z0EXq-CQ";

export default function DetailListingMap({ 
  lat, 
  lng, 
  name,
  address 
}: DetailListingMapProps) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: lng,
    latitude: lat,
    zoom: 16,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const [showPopup, setShowPopup] = useState(true);

  return (
    <Card className="w-full overflow-hidden">
      <div className="w-full h-[400px] relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          style={{ width: '100%', height: '100%' }}
        >
          <Marker
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setShowPopup(true);
            }}
          >
            <MapPin className="w-6 h-6 text-red-500 hover:text-red-700 cursor-pointer" />
          </Marker>

          {showPopup && (
            <Popup
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClose={() => setShowPopup(false)}
              closeOnClick={false}
              offset={25}
            >
              <div className="p-2">
                <h3 className="font-semibold">{name}</h3>
                {address && <p className="text-xs text-gray-600 mt-1">{address}</p>}
              </div>
            </Popup>
          )}

          <NavigationControl position="top-right" />
        </Map>
      </div>
    </Card>
  );
}