"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Store, Utensils, Bus, School, Hospital, Building2, Car } from 'lucide-react';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  supermarket: <Store className="w-4 h-4" />,
  restaurant: <Utensils className="w-4 h-4" />,
  hospital: <Hospital className="w-4 h-4" />,
  school: <School className="w-4 h-4" />,
  bus_station: <Bus className="w-4 h-4" />,
  police: <Building2 className="w-4 h-4" />,
  park: <Car className="w-4 h-4" />
};

interface Amenity {
  id: string;
  type: string;
  name?: string;
  distance?: number; // in km
  latitude?: number;
  longitude?: number;
}

export default function NearbyAmenitiesClient({ amenities }: { amenities: Amenity[] }) {
  const handleClick = (a: Amenity) => {
    if (!a.latitude || !a.longitude) return;
    // Dispatch a CustomEvent that the map listens for
    const ev = new CustomEvent('caimax:flyToAmenity', {
      detail: {
        id: a.id,
        latitude: a.latitude,
        longitude: a.longitude,
        name: a.name,
        type: a.type,
        distance: a.distance
      },
    });
    window.dispatchEvent(ev);
  };

  return (
    <div className="mt-4 bg-white/90 p-2 rounded-lg shadow-sm">
      <h4 className="text-xs font-medium mb-1.5 px-1">Nearby Places</h4>
      {amenities.length === 0 ? (
        <p className="text-sm text-gray-500">No nearby amenities recorded.</p>
      ) : (
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent" />
          </div>
          
          {/* Add padding-right to compensate for scrollbar width and prevent layout shift */}
          <ul className="flex gap-2 overflow-x-auto pb-4 -mb-3 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
            {amenities.map((a) => (
              <li key={a.id} className="flex-none">
                <button
                  onClick={() => handleClick(a)}
                  onMouseDown={(e) => e.preventDefault()} /* prevent browser auto-scroll on first click */
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                      e.preventDefault();
                      handleClick(a);
                    }
                  }}
                  className="snap-center min-w-[100px] bg-white/50 backdrop-blur-sm rounded-lg p-2 ring-1 ring-black/5 hover:ring-black/10 hover:bg-white/80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 group"
                  type="button"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-gray-50 rounded text-gray-600 group-hover:text-gray-900 transition-colors">
                      {AMENITY_ICONS[a.type] || <MapPin className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-medium text-gray-900 truncate w-full max-w-[120px]">{a.name || a.type}</div>
                      <div className="text-[10px] text-gray-500">{Math.round((a.distance ?? 0) * 1000)}m</div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
