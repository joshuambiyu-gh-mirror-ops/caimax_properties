
'use client';
import { ArrowsPointingOutIcon, HomeIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import Image from "next/image";
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
  const images = listing.images.map(img => `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${img.url}`);
  const [curr, setCurr] = useState(0);

  const prev = () => setCurr((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === images.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval]);

  return (
  <div className="max-w-sm h-[400px] flex flex-col overflow-hidden relative w-full mx-auto shadow-lg rounded-lg hover:shadow-red-500/50 transition-shadow duration-300">
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
  );
}