/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useGetProductBySlug } from "@/api/getProductBySlug";
import { useParams } from "next/navigation";
import SkeletonProduct from "./components/skeleton-product";
import InfoProduct from "@/app/(routes)/product/[productSlug]/components/info-product";
import { ProductImage } from "@/components/product-image";
import { ChevronUp, ChevronDown } from "lucide-react";

const THUMBS_VISIBLE = 5;

export default function Page() {
  const params = useParams();
  const productSlug = Array.isArray(params.productSlug)
    ? params.productSlug[0]
    : params.productSlug;

  const { product, loading, error } = useGetProductBySlug(productSlug);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);

  if (loading) return <SkeletonProduct />;
  if (error || !product) return <p className="text-center py-20">No se encontró el producto</p>;

  const images: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [];

  const safeIdx = Math.min(selectedIdx, Math.max(0, images.length - 1));
  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + THUMBS_VISIBLE < images.length;

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-20 sm:px-16">

      {/* ── Desktop: thumbnails | main image | info ── */}
      <div className="hidden sm:grid gap-6 items-start"
        style={{ gridTemplateColumns: images.length > 1 ? "72px 1fr 1fr" : "1fr 1fr" }}>

        {/* Thumbnail strip (only when multiple images) */}
        {images.length > 1 && (
          <div className="flex flex-col items-center gap-2">
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
              const realIdx = thumbOffset + i;
              const isActive = realIdx === safeIdx;
              return (
                <button
                  key={realIdx}
                  onClick={() => setSelectedIdx(realIdx)}
                  className={`w-[68px] h-[68px] rounded-xl overflow-hidden border-2 transition-all bg-white shrink-0 ${
                    isActive
                      ? "border-sky-500 shadow-md shadow-sky-100"
                      : "border-slate-100 opacity-55 hover:opacity-100 hover:border-slate-300"
                  }`}
                >
                  <img src={url} alt={`Miniatura ${realIdx + 1}`} className="w-full h-full object-contain" />
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
        )}

        {/* Main image */}
        <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-100 bg-white">
          {images.length > 0
            ? <img src={images[safeIdx]} alt={product.productName} className="w-full h-full object-contain" />
            : <ProductImage className="w-full h-full" />}
        </div>

        {/* Product info */}
        <div className="px-4">
          <InfoProduct product={product} />
        </div>
      </div>

      {/* ── Mobile: main image → thumbnails strip → info ── */}
      <div className="flex flex-col gap-4 sm:hidden px-3">
        <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-100 bg-white">
          {images.length > 0
            ? <img src={images[safeIdx]} alt={product.productName} className="w-full h-full object-contain" />
            : <ProductImage className="w-full h-full" />}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-white ${
                  i === safeIdx
                    ? "border-sky-500 shadow-md shadow-sky-100"
                    : "border-slate-100 opacity-55 hover:opacity-100"
                }`}
              >
                <img src={url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        )}

        <InfoProduct product={product} />
      </div>
    </div>
  );
}
