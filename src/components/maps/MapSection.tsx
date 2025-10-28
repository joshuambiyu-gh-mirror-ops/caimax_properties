'use client';

import { MapboxListingMap } from '@/components/maps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import NearbyAmenitiesClient from '@/components/nearby-amenities/NearbyAmenitiesClient';
import { type Amenity } from '@prisma/client';

interface MapSectionProps {
  listingId: string;
  lat: number;
  lng: number;
  name: string;
  address?: string;
  nearestPerType: Amenity[];
}

export default function MapSection({
  listingId,
  lat,
  lng,
  name,
  address,
  nearestPerType
}: MapSectionProps) {
  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Location & Nearby Places</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="font-medium"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('caimax:resetMapView'));
            }}
          >
            Reset Map View
          </Button>
        </div>
        <div className="aspect-[16/9] rounded-lg overflow-hidden">
          <MapboxListingMap
            listingId={listingId}
            lat={lat}
            lng={lng}
            name={name}
            address={address}
          />
        </div>
        
        {/* Client-rendered Nearby Amenities in a horizontal scrollable row */}
        <div className="mt-6">
          <NearbyAmenitiesClient amenities={nearestPerType} />
        </div>
      </div>
    </Card>
  );
}