'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Dialog } from '@/components/ui/dialog';
import {
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyGalleryProps {
  images: string[];
}

export default function PropertyGallery({ 
  images, 
  hasVirtualStaging = false,
  stagingOptions = []
}: PropertyGalleryProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StageStyle | null>(null);
  const [showStagingInfo, setShowStagingInfo] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const styleOptions: StageStyle[] = [
    'Modern', 'No Furniture', 'Scandinavian',
    'Industrial', 'Midcentury', 'Luxury',
    'Farmhouse', 'Coastal'
  ];

  const next = () => setCurrentIndex((i) => (i + 1) % images.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  // Keyboard navigation
  useEffect(() => {
    if (!showFullscreen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setShowFullscreen(false);
      if (e.key === 'Space') setIsZoomed(z => !z);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreen]);

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

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setScale(s => {
      const newScale = direction === 'in' ? s + 0.5 : s - 0.5;
      return Math.min(Math.max(newScale, 1), 3); // Limit scale between 1 and 3
    });
  }, []);

  const handleImageDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !isDragging) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - bounds.left) / scale;
    const y = (e.clientY - bounds.top) / scale;
    setPosition({ x, y });
  }, [isZoomed, isDragging, scale]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  const mainImage = images[0];
  const gridImages = images.slice(1, 5);
  const remainingCount = images.length - 5;

  return (
    <div className="space-y-4">
      {/* Main Gallery */}
      <div className="relative h-[600px] cursor-pointer group">
        <div className="relative w-full h-full" onClick={() => setShowFullscreen(true)}>
          <Image
            src={images[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
            <div className="mt-4 grid grid-cols-4 lg:grid-cols-8 gap-4">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden group",
                    selectedStyle === style && "ring-2 ring-blue-500"
                  )}
                >
                  <Image
                    src={stagingOptions.find(opt => opt.name === style)?.image || images[0]}
                    alt={style}
                    fill
                    className="object-cover"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-black/40 flex items-end justify-center p-2 group-hover:bg-black/30",
                    selectedStyle === style && "bg-black/20"
                  )}>
                    <span className="text-white text-sm font-medium">{style}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Gallery View */}
      <div className="relative h-[600px] cursor-pointer group">
        {/* Main Large Image */}
        <div className="relative w-full h-full" onClick={() => setShowFullscreen(true)}>
          <Image
            src={selectedStyle ? (stagingOptions.find(opt => opt.name === selectedStyle)?.image || images[currentIndex]) : images[currentIndex]}
            alt={`Property image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />

        {/* Right Side Grid */}
        <div className="grid grid-cols-2 gap-2 h-full">
          {gridImages.map((image, index) => (
            <div
              key={index}
              className="relative"
              onClick={() => {
                setCurrentIndex(index + 1);
                setShowFullscreen(true);
              }}
            >
              <Image
                src={image}
                alt={`Property image ${index + 2}`}
                fill
                className={cn(
                  "object-cover",
                  index === 0 && "rounded-tr-lg",
                  index === 3 && "rounded-br-lg"
                )}
              />
              <div className={cn(
                "absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors",
                index === 0 && "rounded-tr-lg",
                index === 3 && "rounded-br-lg"
              )} />
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-br-lg">
                  <span className="text-white text-xl font-semibold">+{remainingCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Gallery Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullscreen(true);
            }}
            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullscreen(true);
            }}
            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogOverlay className="bg-black/90" />
        <DialogContent className="max-w-7xl w-full h-[90vh] bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Property Image Gallery</DialogTitle>
          <div className="relative h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 text-white z-50">
              <span className="text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>

            {/* Navigation arrows */}
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

            {/* Main image */}
            <motion.div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleImageDrag}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    scale: scale,
                    x: position.x,
                    y: position.y,
                    cursor: isZoomed ? 'grab' : 'default'
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[currentIndex]}
                    alt={`Property image ${currentIndex + 1}`}
                    fill
                    className={cn(
                      "object-contain transition-transform duration-200",
                      isZoomed && "cursor-grab"
                    )}
                    priority
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#CCCCCC"/></svg>'
                    ).toString('base64')}`}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Zoom controls */}
            <div className="absolute top-20 right-4 flex flex-col gap-2">
              <button
                onClick={() => handleZoom('in')}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                disabled={scale >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                disabled={scale <= 1}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              {isZoomed && (
                <button
                  onClick={resetZoom}
                  className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnail belt */}
            <div 
              ref={thumbnailsRef}
              className="absolute bottom-4 left-0 right-0 mx-auto flex gap-2 p-2 bg-black/50 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-w-[80%]"
              style={{
                scrollbarWidth: 'thin',
                msOverflowStyle: 'none'
              }}
            >
              {images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-14 rounded overflow-hidden",
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
                    sizes="80px"
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
    </>
  );
}