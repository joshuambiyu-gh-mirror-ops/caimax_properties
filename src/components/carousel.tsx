"use client";
import { ArrowsPointingOutIcon, HomeIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { LoadingSpinner } from "./ui/loading-spinner";
import { ChevronLeft, ChevronRight } from "react-feather";
import type { ListingWithImages } from "@/actions/get-listings";

interface CarouselProps {
  listing: ListingWithImages;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export default function Carousel({
  listing,
  autoSlide = false,
  autoSlideInterval = 3000,
}: CarouselProps) {
  const images = listing.images.map((img) => img.url);
  const router = useRouter();
  const [curr, setCurr] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const prev = useCallback(() => setCurr((c) => (c === 0 ? images.length - 1 : c - 1)), [images.length]);
  const next = useCallback(() => setCurr((c) => (c === images.length - 1 ? 0 : c + 1)), [images.length]);

  const handleNavigation = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsNavigating(true);
    await router.push(`/${listing.id}`);
  };

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval, next]);

  return (
    <>
      {isNavigating && <LoadingSpinner />}

      {/* Unified card */}
      <div className="max-w-sm mx-auto shadow-lg rounded-lg overflow-hidden transition-all duration-300 bg-white">
        {/* Image area */}
        <div className="relative w-full aspect-[3/4] h-[400px] bg-gray-100">
          <div className="flex h-full transition-transform ease-out duration-500" style={{ transform: `translateX(-${curr * 100}%)` }}>
            {images.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 relative h-full">
                <Image src={image} alt={`Slide ${index + 1}`} fill className="object-cover" priority={index === 0} />
              </div>
            ))}
          </div>

          {/* nav */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button onClick={prev} className="p-2 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white">
              <ChevronLeft size={15} />
            </button>
            <button onClick={next} className="p-2 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white">
              <ChevronRight size={15} />
            </button>
          </div>

          {/* dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full bg-white transition-all ${curr === i ? "p-1" : "bg-opacity-50"}`} />
            ))}
          </div>
        </div>

        {/* Content section */}
        <div className="px-3 py-2 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg text-gray-800 font-semibold truncate flex-1" title={`${listing.propertyType} in ${listing.location}`}>
              {listing.propertyType} in {listing.location}
            </h2>
            {listing.price && (
              <span className="text-sm font-semibold text-gray-800 flex-shrink-0 whitespace-nowrap">KES {listing.price.toLocaleString()}</span>
            )}
          </div>

          <div className="flex flex-col gap-0.5 text-sm text-gray-700 mt-1">
            {/* Row 1: Name and Location */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center min-w-0 flex-1">
                <HomeIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="ml-1 truncate font-medium text-xs" title={listing.name}>{listing.name}</span>
              </div>
              <div className="flex items-center flex-shrink-0 gap-1">
                <MapPinIcon className="h-4 w-4 text-red-500" />
                <span className="text-xs truncate" title={listing.location}>{listing.location}</span>
              </div>
            </div>

            {/* Row 2: Footage + Beds + Baths + See more all in one line */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center">
                  <ArrowsPointingOutIcon className="h-4 w-4 text-gray-400" />
                  <span className="ml-1 whitespace-nowrap text-xs">{listing.footage} sq ft</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm">🛏️</span>
                  <span className="ml-1 text-xs font-medium">{listing.bedroomCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm">🛁</span>
                  <span className="ml-1 text-xs font-medium">{listing.bathroomCount}</span>
                </div>
              </div>
              <button
                onClick={handleNavigation}
                className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full border border-red-200 transition-colors whitespace-nowrap flex-shrink-0"
              >
                See more
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
