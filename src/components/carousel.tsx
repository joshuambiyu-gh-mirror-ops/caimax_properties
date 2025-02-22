'use client';  
import { ArrowsPointingOutIcon, HomeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "react-feather";

export default function Carousel({
  images,
  autoSlide = false,
  autoSlideInterval = 3000,
}: {
  images: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
}) {
  const [curr, setCurr] = useState(0);

  const prev = () => setCurr((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === images.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval, next]);

  return (
    <div className="max-w-sm overflow-hidden relative w-full mx-auto shadow-lg rounded-lg hover:shadow-red-500/50 transition-shadow duration-300">
      {/* Slide Container */}
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0 relative h-64">
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className="w-full h-auto object-cover rounded-t-lg"
              priority={index === 0} // Optimize the first image
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

      {/* Description */}
      <div className="bg-white border-t border-gray-300 p-4 rounded-b-lg relative z-10">
        <div className="flex items-center justify-between text-gray-700 line-clamp-2">
          <span className="flex items-center gap-4 ">
            <div className="flex items-center"><HomeIcon className="h-7 w-7 text-red-500"/>:</div>
            <div className="flex"><ArrowsPointingOutIcon className="h-7 w-7 text-black-500" />:</div>   
            <div className="flex items-center">|  🛁:</div>
            <div className="flex items-center">|  🛏️:</div>
            <div className="flex items-center">|   :</div> 
          </span>
        </div>
      </div>
    </div>
  );
}



