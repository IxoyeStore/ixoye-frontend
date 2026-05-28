"use client";

import { useState, useRef } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProductImage } from "@/components/product-image";

const THUMBS_VISIBLE = 5;
const ZOOM_FACTOR = 3;

type Props = {
  images: string[];
  productName: string;
};

export default function ProductGallery({ images, productName }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const zoomRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = zoomRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  // background-position maps origin% so the zoomed view centres on cursor
  const bgX = Math.min(100, Math.max(0, ((ZOOM_FACTOR * origin.x - 50) / 2)));
  const bgY = Math.min(100, Math.max(0, ((ZOOM_FACTOR * origin.y - 50) / 2)));

  // lens box: 1/ZOOM_FACTOR of image size, centered on cursor, clamped inside image
  const lensSize = 100 / ZOOM_FACTOR;
  const lensLeft = Math.min(100 - lensSize, Math.max(0, origin.x - lensSize / 2));
  const lensTop  = Math.min(100 - lensSize, Math.max(0, origin.y - lensSize / 2));

  const safeIdx = Math.min(selectedIdx, Math.max(0, images.length - 1));
  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + THUMBS_VISIBLE < images.length;

  const prev = () => setSelectedIdx((i) => Math.max(0, i - 1));
  const next = () => setSelectedIdx((i) => Math.min(images.length - 1, i + 1));

  const ThumbnailButton = ({ idx }: { idx: number }) => (
    <button
      onClick={() => setSelectedIdx(idx)}
      className={`w-[68px] h-[68px] rounded-xl overflow-hidden border-2 transition-all bg-white shrink-0 ${
        idx === safeIdx
          ? "border-sky-500 shadow-md shadow-sky-100"
          : "border-slate-100 opacity-55 hover:opacity-100 hover:border-slate-300"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[idx]} alt={`Miniatura ${idx + 1}`} draggable={false} className="w-full h-full object-contain" />
    </button>
  );

  return (
    <>
      {/* ── Desktop: vertical thumbs + main image ─────────────────────────── */}
      <div className="hidden sm:block relative">
        <div className="flex gap-3 items-start">
          {images.length > 1 && (
            <div className="flex flex-col items-center gap-2 w-[68px] shrink-0">
              {images.length > THUMBS_VISIBLE && (
                <button
                  onClick={() => setThumbOffset((o) => Math.max(0, o - 1))}
                  disabled={!canScrollUp}
                  className="w-full flex justify-center py-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
              )}
              {images.slice(thumbOffset, thumbOffset + THUMBS_VISIBLE).map((_, i) => (
                <ThumbnailButton key={thumbOffset + i} idx={thumbOffset + i} />
              ))}
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

          <div
            ref={zoomRef}
            className="relative flex-1 aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white cursor-crosshair select-none"
            onMouseEnter={() => images.length > 0 && setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => images.length > 0 && setLightboxOpen(true)}
          >
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[safeIdx]}
                alt={productName}
                draggable={false}
                className="w-full h-full object-contain"
              />
            ) : (
              <ProductImage className="w-full h-full" />
            )}
            {/* Overlay prevents "Save image as" while allowing link-navigation context menu */}
            <div className="absolute inset-0" />

            {/* Lens indicator */}
            {zoomed && (
              <div
                className="absolute pointer-events-none border-2 border-sky-400 bg-sky-400/10 rounded-sm"
                style={{
                  left:   `${lensLeft}%`,
                  top:    `${lensTop}%`,
                  width:  `${lensSize}%`,
                  height: `${lensSize}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* Outer zoom panel — appears to the right overlaying the info column */}
        {zoomed && images.length > 0 && (
          <div
            className="absolute top-0 left-[calc(100%+1.5rem)] w-[130%] aspect-square rounded-2xl border border-slate-200 shadow-xl z-20 overflow-hidden pointer-events-none"
            style={{
              backgroundImage: `url(${images[safeIdx]})`,
              backgroundSize: `${ZOOM_FACTOR * 100}%`,
              backgroundPosition: `${bgX}% ${bgY}%`,
              backgroundRepeat: "no-repeat",
              backgroundColor: "#fff",
            }}
          />
        )}
      </div>

      {/* ── Mobile: main image + nav arrows + horizontal thumbs ───────────── */}
      <div className="flex flex-col gap-3 sm:hidden px-3">
        <div
          className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-100 bg-white select-none"
          onClick={() => images.length > 0 && setLightboxOpen(true)}
        >
          {images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[safeIdx]} alt={productName} draggable={false} className="w-full h-full object-contain" />
          ) : (
            <ProductImage className="w-full h-full" />
          )}
          <div className="absolute inset-0 pointer-events-none" />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                disabled={safeIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center disabled:opacity-20 shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                disabled={safeIdx === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center disabled:opacity-20 shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-white ${
                  i === safeIdx
                    ? "border-sky-500 shadow-md shadow-sky-100"
                    : "border-slate-100 opacity-55 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[i]} alt={`Miniatura ${i + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                disabled={safeIdx === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white disabled:opacity-20 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                disabled={safeIdx === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white disabled:opacity-20 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[safeIdx]}
              alt={productName}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-6 flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedIdx(i); }}
                  className={`h-2 rounded-full transition-all ${
                    i === safeIdx ? "bg-white w-5" : "bg-white/40 w-2 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
