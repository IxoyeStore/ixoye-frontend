/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const images = [
  "/carousel-banner/banner-ixoye-parts.jpeg",
  "/carousel-banner/banner-dizzel-logo.jpeg",
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
    <div className="w-full select-none">
      <div className="w-full relative overflow-hidden bg-slate-100">
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
                  className="relative w-full h-[200px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden cursor-pointer"
                  onMouseDown={() => setIsPaused(true)}
                  onMouseUp={() => setIsPaused(false)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
                  />

                  <img
                    src={src}
                    alt={`Banner ${index + 1}`}
                    className="relative z-10 h-full w-full object-contain drop-shadow-md"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all duration-500 rounded-full border-none cursor-pointer shadow-sm ${
                index === currentIndex
                  ? "w-10 bg-sky-500"
                  : "w-2 bg-slate-400/50 hover:bg-slate-500"
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
