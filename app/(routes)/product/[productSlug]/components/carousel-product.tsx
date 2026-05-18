/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CarouselProductProps {
  images: string[];
}

const THUMBS_VISIBLE = 5;

const CarouselProduct = ({ images }: CarouselProductProps) => {
  const [selected, setSelected] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);

  if (!images || images.length === 0) {
    return <ProductImage className="aspect-square w-full rounded-2xl" />;
  }

  if (images.length === 1) {
    return (
      <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-100 bg-white">
        <ProductImage url={images[0]} alt="Imagen del producto" className="w-full h-full object-contain" />
      </div>
    );
  }

  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + THUMBS_VISIBLE < images.length;

  return (
    <div className="w-full">
      {/* Desktop: side-by-side thumbnails + main image */}
      <div className="hidden sm:flex gap-3 w-full">
        {/* Thumbnail strip */}
        <div className="flex flex-col items-center gap-2 w-[72px] shrink-0">
          {images.length > THUMBS_VISIBLE && (
            <button
              onClick={() => setThumbOffset((o) => Math.max(0, o - 1))}
              disabled={!canScrollUp}
              className="w-full flex justify-center py-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
            >
              <ChevronUp size={16} />
            </button>
          )}

          {images.slice(thumbOffset, thumbOffset + THUMBS_VISIBLE).map((url, i) => {
            const realIndex = thumbOffset + i;
            const isActive = realIndex === selected;
            return (
              <button
                key={realIndex}
                onClick={() => setSelected(realIndex)}
                className={`w-[68px] h-[68px] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                  isActive
                    ? "border-sky-500 shadow-md shadow-sky-100"
                    : "border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <img src={url} alt={`Miniatura ${realIndex + 1}`} className="w-full h-full object-contain" />
              </button>
            );
          })}

          {images.length > THUMBS_VISIBLE && (
            <button
              onClick={() => setThumbOffset((o) => Math.min(images.length - THUMBS_VISIBLE, o + 1))}
              disabled={!canScrollDown}
              className="w-full flex justify-center py-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        {/* Main image */}
        <div className="flex-1 aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white">
          <img
            src={images[selected]}
            alt={`Imagen ${selected + 1}`}
            className="w-full h-full object-contain transition-opacity duration-200"
          />
        </div>
      </div>

      {/* Mobile: main image + horizontal thumbnail strip */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-100 bg-white">
          <img
            src={images[selected]}
            alt={`Imagen ${selected + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-white ${
                i === selected
                  ? "border-sky-500 shadow-md shadow-sky-100"
                  : "border-slate-100 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselProduct;
