/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white">
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
                <div className="flex items-center justify-center bg-white w-full">
                  <img
                    src={src}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-28 md:h-64 lg:h-[380px] object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                index === currentIndex ? "w-8 bg-sky-600" : "w-2 bg-sky-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselTextBanner;
