'use client';
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
    <div className="max-w-lg mx-auto relative shadow-lg rounded-lg">
      {/* Main Image Slider */}
      <div className="relative overflow-hidden rounded-t-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${curr * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 relative h-64">
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                fill
                className="w-full h-auto object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-2">
          <button onClick={prev} className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Thumbnail Belt */}
      <div className="flex overflow-x-auto gap-2 p-2 bg-gray-100 rounded-b-lg">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurr(index)}
            className={`relative w-20 h-14 flex-shrink-0 border-2 ${
              curr === index ? "border-red-500" : "border-transparent"
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover rounded"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
