/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const images = ["/carousel-banner/banner-ixoye-parts.jpeg"];

const CarouselTextBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMultiple = images.length > 1;

  const nextSlide = useCallback(() => {
    if (!isMultiple) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [isMultiple]);

  useEffect(() => {
    if (!isMultiple || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, isMultiple]);

  return (
    <div className="w-full select-none">
      {/* Contenedor principal con fondo oscuro para evitar saltos de luz */}
      <div className="w-full relative overflow-hidden bg-[#001529]">
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
                  className="relative w-full max-w-[2560px] mx-auto h-[250px] md:h-[400px] lg:h-[450px] flex items-center justify-center overflow-hidden"
                  onMouseDown={() => isMultiple && setIsPaused(true)}
                  onMouseUp={() => isMultiple && setIsPaused(false)}
                  onMouseLeave={() => isMultiple && setIsPaused(false)}
                  onTouchStart={() => isMultiple && setIsPaused(true)}
                  onTouchEnd={() => isMultiple && setIsPaused(false)}
                >
                  <img
                    src={src}
                    alt={
                      isMultiple ? `Banner ${index + 1}` : "Banner Principal"
                    }
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {isMultiple && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 transition-all duration-500 rounded-full border-none cursor-pointer shadow-sm ${
                  index === currentIndex
                    ? "w-10 bg-sky-500"
                    : "w-2 bg-white/50 hover:bg-white"
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarouselTextBanner;
