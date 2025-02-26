
import CarouselFull from '@/components/carousel-full-view';
import React from 'react'

export default function CarouselTest() {
  const images = [
    "/ls1.jpg",
    "/ls2.jpg",
    "/ls3.jpg",
    "/ls4.jpg",
    "/ls5.jpg",
    "/ls6.jpg"
  ];

  return (
    <div>
        <CarouselFull 
          images={images}
          autoSlide={true}
          autoSlideInterval={5000}
        />
    </div>
  )
}