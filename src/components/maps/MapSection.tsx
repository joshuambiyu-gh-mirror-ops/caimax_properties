'use client';

import { MapboxListingMap } from '@/components/maps';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import NearbyAmenitiesClient from '@/components/nearby-amenities/NearbyAmenitiesClient';
import { motion } from 'framer-motion';

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
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeaderHeight(el.getBoundingClientRect().height || 0);
    });
    ro.observe(el);
    // initial
    setHeaderHeight(el.getBoundingClientRect().height || 0);
    return () => ro.disconnect();
  }, []);

  return (
    <Card className="w-full overflow-hidden shadow-lg p-0 rounded-none sm:rounded-xl border-0 flex flex-col">
      <div className="relative w-full flex-1">
        <div ref={headerRef} className="absolute top-0 left-0 right-0 z-10 flex flex-row flex-wrap items-center justify-between gap-2 p-2 sm:p-4 bg-transparent">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg sm:text-xl font-bold text-white drop-shadow-lg truncate max-w-[65%] sm:max-w-none"
            style={{
              textShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            Location & Nearby Places
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button
              variant="default"
              size="sm"
              className="font-bold w-auto text-xs sm:text-sm px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all border border-blue-500"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('caimax:resetMapView'));
              }}
            >
              Reset Map View
            </Button>
          </motion.div>
        </div>
        {/* Map - fills all available space */}
        <div className="w-full h-[320px] sm:h-[420px] md:h-[500px] rounded-b-xl overflow-hidden">
          <MapboxListingMap
            listingId={listingId}
            lat={lat}
            lng={lng}
            headerOffset={headerHeight}
          />
        </div>
      </div>
      {/* Amenities - separate section below */}
      <div className="bg-white w-full">
        <NearbyAmenitiesClient amenities={nearestPerType} />
      </div>
    </Card>
  );
}