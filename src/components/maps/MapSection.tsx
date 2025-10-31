'use client';

import { MapboxListingMap } from '@/components/maps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import NearbyAmenitiesClient from '@/components/nearby-amenities/NearbyAmenitiesClient';

import { ProcessedAmenity } from '@/lib/calculate-nearby-amenities';

interface MapSectionProps {
  listingId: string;
  lat: number;
  lng: number;
  nearestPerType: ProcessedAmenity[];
}

export default function MapSection({
  listingId,
  lat,
  lng,
  nearestPerType
}: MapSectionProps) {
  return (
  <Card className="overflow-hidden shadow-lg p-0 rounded-none sm:rounded-xl border-0">
      <div className="relative w-full">
        <div className="absolute top-0 left-0 right-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-white/90 backdrop-blur-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Location & Nearby Places</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="font-medium w-full sm:w-auto bg-white"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('caimax:resetMapView'));
            }}
          >
            Reset Map View
          </Button>
        </div>
        {/* let the map component control its own height (remove outer aspect wrapper that caused double-sizing) */}
        <div className="w-full">
          <MapboxListingMap
            listingId={listingId}
            lat={lat}
            lng={lng}
          />
        </div>
        {/* pull the amenities up to touch the map and remove border so it blends */}
        <div className="-mt-[4px] bg-white">
          <NearbyAmenitiesClient amenities={nearestPerType} />
        </div>
      </div>
    </Card>
  );
}