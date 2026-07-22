"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/formatPrice";
import { ProductImage } from "@/components/product-image";
import { ProductType } from "@/types/product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const API = process.env.NEXT_PUBLIC_API_URL;

const STOP_WORDS = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas",
  "en", "y", "a", "para", "con", "sin", "por", "al",
]);

function getKeywords(name: string): string[] {
  return name
    .split(/\s+/)
    .map((w) => w.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/gi, ""))
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 4);
}

interface Props {
  productName: string;
  currentProductId: number;
}

export default function RelatedProductsSection({ productName, currentProductId }: Props) {
  const { user } = useAuth();
  const isB2B = user?.profile?.type === "b2b";
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const keywords = getKeywords(productName);
    if (keywords.length === 0) { setLoading(false); return; }

    const orFilters = keywords
      .map((w, i) => `filters[$or][${i}][productName][$containsi]=${encodeURIComponent(w)}`)
      .join("&");

    fetch(
      `${API}/api/products?${orFilters}&filters[id][$ne]=${currentProductId}&pagination[limit]=10&sort=isFeatured:desc,createdAt:desc`
    )
      .then((r) => r.json())
      .then((json) => {
        setProducts((json.data ?? []).slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productName, currentProductId]);

  if (!loading && products.length === 0) return null;

  const skeletons = Array.from({ length: 5 });

  return (
    <div className="max-w-7xl py-4 mx-auto sm:py-10 sm:px-24 px-2">
      <h3 className="px-4 text-2xl sm:text-3xl font-bold text-[#003366] dark:text-sky-400 mb-4 sm:mb-8 tracking-tighter text-left">
        Productos relacionados
      </h3>

      <Carousel opts={{ dragFree: true, loop: false }} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-3">
          {loading
            ? skeletons.map((_, i) => (
                <CarouselItem key={i} className="basis-1/2 sm:basis-1/3 lg:basis-1/5 pl-2 md:pl-3">
                  <div className="flex flex-col gap-2 rounded-xl border border-sky-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 animate-pulse">
                    <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700" />
                    <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-700" />
                    <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-slate-700" />
                    <div className="h-4 w-2/5 rounded bg-slate-100 dark:bg-slate-700" />
                  </div>
                </CarouselItem>
              ))
            : products.map((product) => {
                const { id, slug, images, productName: name, price, wholesalePrice } = product;
                const finalPrice = isB2B && wholesalePrice ? wholesalePrice : price;
                return (
                  <CarouselItem key={id} className="basis-1/2 sm:basis-1/3 lg:basis-1/5 pl-2 md:pl-3">
                    <Link
                      href={`/product/${slug}`}
                      className="flex flex-col gap-2 rounded-xl border border-sky-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm hover:shadow-md hover:shadow-sky-100/50 dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-200 group h-full"
                    >
                      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-700">
                        <ProductImage
                          url={images?.[0]}
                          alt={name}
                          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-sky-900 dark:text-sky-300 line-clamp-2 leading-tight">
                        {name}
                      </h4>
                      <div className="flex flex-col mt-auto">
                        {isB2B && wholesalePrice && (
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 line-through leading-none">
                            {formatPrice(price)}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm font-black italic text-green-700 dark:text-green-400">
                          {formatPrice(finalPrice)}
                        </p>
                        {isB2B && wholesalePrice && (
                          <span className="mt-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase not-italic tracking-normal shadow-sm w-fit">
                            Preferencial
                          </span>
                        )}
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
