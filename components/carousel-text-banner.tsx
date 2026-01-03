/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const images = [
  // "/carousel-banner/banner-dizzel-emmark.jpeg",
  // "/carousel-banner/banner-dizzel-logo.jpeg",
  "/carousel-banner/banner-emmark.jpeg",
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
    <div className="w-full text-center relative">
      <Carousel className="max-w-8xl mx-auto">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem
              key={index}
              className={`transition-opacity duration-1000 ${
                index === currentIndex
                  ? "opacity-100 relative"
                  : "opacity-0 absolute top-0 left-0 w-full"
              }`}
            >
              <img
                src={src}
                alt={`Banner ${index + 1}`}
                className="w-full h-20 md:h-48 object-contain"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CarouselTextBanner;
