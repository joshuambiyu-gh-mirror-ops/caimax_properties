'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Dialog } from '@/components/ui/dialog';
import {
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyGalleryProps {
  images: string[];
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => 
    setCurrentIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  const prev = useCallback(() => 
    setCurrentIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!showFullscreen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setShowFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreen, next, prev]);

  // Scroll thumbnail into view
  useEffect(() => {
    if (!thumbnailsRef.current) return;
    const thumbnails = thumbnailsRef.current.children;
    if (thumbnails[currentIndex]) {
      thumbnails[currentIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIndex]);

  return (
    <div className="space-y-4">
      {/* Main Gallery */}
      <div className="shadow-md rounded-lg relative aspect-[4/3] sm:aspect-[16/9] cursor-pointer hover:shadow-red-500/50 group">
        <div className="relative w-full rounded-lg h-full hover:translate-z-60 transition-transform transition-duration-300" onClick={() => setShowFullscreen(true)}>
          <Image
            src={images[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            fill
            className="object-cover absolute z-6 rounded-lg"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 66vw"
          />

          {/* Navigation Controls */}
          <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="bg-white/90 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="bg-white/90 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <div className="bg-black/75 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
              {currentIndex + 1} of {images.length}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullscreen(true);
              }}
              className="bg-black/75 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 hover:bg-black/90 transition-colors"
            >
              <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">View larger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div 
        ref={thumbnailsRef}
        className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-w-full px-2 sm:px-4"
      >
        {images.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded overflow-hidden",
              currentIndex === index && "ring-2 ring-blue-500"
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 80px, 96px"
            />
            <div className={cn(
              "absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors",
              currentIndex === index && "bg-black/10"
            )} />
          </motion.button>
        ))}
      </div>

      {/* Fullscreen Gallery Modal */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] bg-black border-none p-0">
          <DialogTitle className="sr-only">Property Image Gallery</DialogTitle>
          
          <div className="relative h-full flex items-center justify-center">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute top-4 left-4 text-white z-50">
              <span className="text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full"
              >
                <Image
                  src={images[currentIndex]}
                  alt={`Property image ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#CCCCCC"/></svg>'
                  ).toString('base64')}`}
                />
              </motion.div>
            </AnimatePresence>

            <button
              onClick={prev}
              className="absolute left-4 text-white hover:text-gray-300 z-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={next}
              className="absolute right-4 text-white hover:text-gray-300 z-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div 
              ref={thumbnailsRef}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg overflow-x-auto max-w-[80%]"
            >
              {images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative w-16 h-12 rounded overflow-hidden",
                    currentIndex === index && "ring-2 ring-white"
                  )}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors",
                    currentIndex === index && "bg-black/30"
                  )} />
                </motion.button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}