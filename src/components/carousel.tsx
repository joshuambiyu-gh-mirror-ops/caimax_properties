
'use client';
import { ArrowsPointingOutIcon, HomeIcon, MapPinIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
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
  const images = listing.images.map(img => img.url);
  const router = useRouter();
  const [curr, setCurr] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const prev = useCallback(() => setCurr((c) => (c === 0 ? images.length - 1 : c - 1)), [images.length]);
  const next = useCallback(() => setCurr((c) => (c === images.length - 1 ? 0 : c + 1)), [images.length]);

  const handleNavigation = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      <Link href={`/${listing.id}`} onClick={handleNavigation} className="block">
        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl px-1 text-gray-800 font-medium line-clamp-1 h-7 overflow-hidden" title={`${listing.propertyType} in ${listing.location}`}>
            {listing.propertyType} in {listing.location}
          </h1>
          <div className="aspect-[3/4] max-w-sm h-[400px] flex flex-col overflow-hidden relative w-full mx-auto shadow-lg rounded-lg hover:shadow-red-500/50 transition-all duration-300 cursor-pointer hover:scale-105"
          >
            <div className="flex-1 relative flex flex-col">
        {/* Slide Container */}
        <div
          className="flex transition-transform ease-out duration-500 h-full"
          style={{ transform: `translateX(-${curr * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 relative h-full">
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                fill
                className="w-full h-auto object-cover rounded-t-lg"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <button
            onClick={prev}
            className="p-2 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={next}
            className="p-2 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full bg-white transition-all ${
                curr === i ? "p-1" : "bg-opacity-50"
              }`}
            />
          ))}
        </div>

      </div>

        {/* Description - always at the bottom */}
        <div className="bg-white border-t border-gray-300 p-2 rounded-b-lg relative z-10 flex-none flex flex-col justify-center min-h-[60px]">
            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-4 w-full">
                <div className="flex items-center max-w-[90px]">
                  <HomeIcon className="h-5 w-5 text-red-500"/>
                  <span className="ml-1 text-sm truncate" title={listing.name}>{listing.name}</span>
                </div>
                <div className="flex max-w-[70px]">
                  <ArrowsPointingOutIcon className="h-5 w-5 text-black-500" />
                  <span className="ml-1 text-sm whitespace-nowrap truncate" title={listing.footage + ' sq ft'}>{listing.footage} sq ft</span>
                </div>   
                <div className="flex items-center text-base max-w-[40px]">
                  <span className="text-base">🛁</span> <span className="ml-1 text-sm truncate" title={String(listing.bathroomCount)}>{listing.bathroomCount}</span>
                </div>
                <div className="flex items-center text-base max-w-[40px]">
                  <span className="text-base">🛏️</span> <span className="ml-1 text-sm truncate" title={String(listing.bedroomCount)}>{listing.bedroomCount}</span>
                </div>
                <div className="flex items-center max-w-[100px]">
                  <MapPinIcon className="h-5 w-5 text-red-500"/>
                  <span className="ml-1 text-sm truncate" style={{maxWidth: '70px'}} title={listing.location}>{listing.location}</span>
                </div>
              </span>
            </div>
          </div>
          </div>
        </div>
      </Link>
    </>
  );
}