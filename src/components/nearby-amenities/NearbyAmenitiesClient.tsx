"use client";
import React from 'react';
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
    <div className="px-3 py-2 bg-white/95 rounded-t-lg shadow-md border-t border-gray-100">
      <h4 className="text-sm sm:text-base font-medium mb-2">Nearby Places</h4>
      {amenities.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-500">No nearby amenities recorded.</p>
      ) : (
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent" />
          </div>
          
          {/* On mobile allow wrapping to multiple rows; on sm+ keep horizontal scroll */}
          <ul className="flex flex-wrap gap-2 pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 sm:flex-nowrap sm:overflow-x-auto">
            {amenities.map((a) => (
              <li key={a.id} className="flex-none mb-2 sm:mb-0">
                <button
                  onClick={() => handleClick(a)}
                  onMouseDown={(e) => e.preventDefault()} /* prevent browser auto-scroll on first click */
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                      e.preventDefault();
                      handleClick(a);
                    }
                  }}
                  className="snap-center min-w-[110px] sm:min-w-[140px] bg-white backdrop-blur-sm rounded-lg p-2 ring-1 ring-black/5 hover:ring-black/10 hover:bg-white/95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 group touch-pan-x"
                  type="button"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="p-1.5 bg-gray-50 rounded text-gray-600 group-hover:text-gray-900 transition-colors">
                      {AMENITY_ICONS[a.type] || <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{a.name || a.type}</div>
                      <div className="text-[11px] text-gray-500">{Math.round((a.distance ?? 0) * 1000)}m</div>
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
