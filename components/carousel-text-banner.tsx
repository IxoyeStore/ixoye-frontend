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
  "/carousel-banner/banner-emmark.jpeg",
  "/carousel-banner/banner-dizzel-emmark.jpeg",
  "/carousel-banner/banner-filtracion-aditivos-mangueras-herramientas.jpeg",
  "/carousel-banner/banner-hidraulico-sensores-suspension-bombas.jpeg",
  "/carousel-banner/banner-soporte-bandas-transmision-rodamientos.jpeg",
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
    <div className="w-full bg-white select-none">
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
                  className="flex items-center justify-center bg-white w-full cursor-pointer active:scale-[0.99] transition-transform"
                  onMouseDown={() => setIsPaused(true)}
                  onMouseUp={() => setIsPaused(false)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  <img
                    src={src}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-28 md:h-64 lg:h-[380px] object-contain pointer-events-none"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all duration-500 rounded-full border-none cursor-pointer ${
                index === currentIndex
                  ? "w-8 bg-sky-600"
                  : "w-2 bg-sky-200 hover:bg-sky-400"
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
