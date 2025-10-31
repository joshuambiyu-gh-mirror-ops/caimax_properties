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
    <Card className="overflow-hidden shadow-lg">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Location & Nearby Places</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="font-medium w-full sm:w-auto"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('caimax:resetMapView'));
            }}
          >
            Reset Map View
          </Button>
        </div>
        <div className="aspect-[4/3] sm:aspect-[16/9] rounded-lg overflow-hidden">
          <MapboxListingMap
            listingId={listingId}
            lat={lat}
            lng={lng}
          />
        </div>
        
        {/* Client-rendered Nearby Amenities in a horizontal scrollable row */}
        <div className="mt-4 sm:mt-6">
          <NearbyAmenitiesClient amenities={nearestPerType} />
        </div>
      </div>
    </Card>
  );
}