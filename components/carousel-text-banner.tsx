/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const images = [
  "/carousel-banner/banner-dizzel-logo.jpeg",
  "/carousel-banner/banner-ixoye-parts.jpeg",
  // "/carousel-banner/banner-hidraulico-sensores-suspension-bombas.jpeg",
  // "/carousel-banner/banner-dizzel-emmark.jpeg",
  // "/carousel-banner/banner-soporte-bandas-transmision-rodamientos.jpeg",
];

const CarouselTextBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div className="w-full bg-gradient-to-r from-[#005ba5] via-[#0161c2] to-[#0269be] select-none border-b border-slate-800">
      <div className="w-full relative overflow-hidden">
        <Carousel className="w-full">
          <CarouselContent className="m-0">
            {images.map((src, index) => (
              <CarouselItem
                key={index}
                className={`p-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentIndex
                    ? "opacity-100 relative"
                    : "opacity-0 absolute top-0 left-0 w-full h-full"
                }`}
              >
                <div
                  className="flex items-center justify-center w-full cursor-pointer active:scale-[0.99] transition-transform py-2"
                  onMouseDown={() => setIsPaused(true)}
                  onMouseUp={() => setIsPaused(false)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  <img
                    src={src}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-32 md:h-72 lg:h-[450px] object-contain pointer-events-none drop-shadow-2xl"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 transition-all duration-500 rounded-full border-none cursor-pointer shadow-lg ${
                index === currentIndex
                  ? "w-12 bg-sky-400"
                  : "w-3 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselTextBanner;
