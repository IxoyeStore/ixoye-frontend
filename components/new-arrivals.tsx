/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useGetNewestProducts } from "@/api/useGetNewestProducts";
import { ResponeType } from "@/types/response";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
  type CarouselApi,
} from "./ui/carousel";
import FeaturedSkeleton from "./featuredSkeleton";
import { ProductType } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, PackageX, ArrowRight } from "lucide-react";
import IconButton from "./ui/icon-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { ProductImage } from "@/components/product-image";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/formatPrice";

const AUTOPLAY_MS = 5000;

const NewArrivals = () => {
  const { result, loading, error }: ResponeType = useGetNewestProducts();
  const router = useRouter();
  const { addItem } = useCart();
  const { lovedItems, addLovedItem, removeLovedItem } = useLovedProducts();
  const { user } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const paused = useRef(false);

  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      api.scrollNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [api]);

  const hasFailed = !loading && (error || !result || (Array.isArray(result) && result.length === 0));

  if (hasFailed) {
    return null;
  }

  return (
    <div className="max-w-7xl py-4 mx-auto sm:py-16 sm:px-24 px-2">
      <div className="flex flex-col items-center gap-2 mb-4 px-4 sm:pb-8 sm:flex-row sm:justify-between">
        <h3 className="text-2xl sm:text-3xl font-bold text-[#003366] dark:text-sky-400 italic uppercase tracking-tighter">
          Novedades
        </h3>

        <Link
          href="/novedades"
          className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-sky-700 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors"
        >
          Ver más
          <ArrowRight size={14} />
        </Link>
      </div>

      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{ loop: true, slidesToScroll: "auto" }}
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading && <FeaturedSkeleton items={4} />}

          {!loading &&
            result?.map((product: ProductType) => {
              if (!product) return null;

              const { id, slug, images, productName, price, wholesalePrice, stock } =
                product;
              const isLoved = lovedItems.some((item) => item.id === product.id);
              const isB2B = user?.profile?.type === "b2b";
              const finalPrice =
                isB2B && wholesalePrice ? wholesalePrice : price;
              const outOfStock = !stock || stock <= 0;

              return (
                <CarouselItem
                  key={id}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4 group"
                >
                  <div className="h-full">
                    <Card className="group relative flex h-full flex-col py-3 sm:py-4 border border-sky-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:shadow-sky-100/50 dark:hover:shadow-none transition-all duration-300 bg-white dark:bg-slate-800 rounded-2xl">
                      <div className="absolute left-0 top-0 z-20 h-20 w-20 overflow-hidden pointer-events-none">
                        <span
                          className={`absolute left-[-38px] top-[15px] block w-[150px] -rotate-45 py-1 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md ring-1 ring-white/40 ${
                            outOfStock
                              ? "bg-red-600 dark:bg-red-500"
                              : "bg-gradient-to-r from-orange-500 to-amber-500"
                          }`}
                        >
                          {outOfStock ? "Agotado" : "Nuevo"}
                        </span>
                      </div>

                      <CardContent className="relative flex items-center justify-center px-2 sm:px-6 py-2">
                        <div
                          onClick={() => router.push(`/product/${slug}`)}
                          className="relative w-full aspect-square overflow-hidden cursor-pointer"
                        >
                          <ProductImage
                            url={images?.[0]}
                            alt={productName}
                            className="w-full h-full object-contain transition-transform duration-500"
                          />
                        </div>

                        <div className="absolute w-full px-2 sm:px-6 transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 z-10 hidden sm:block">
                          <div className="flex justify-center gap-x-2 sm:gap-x-4">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                addItem(product);
                              }}
                              icon={
                                <ShoppingCart
                                  size={18}
                                  className="text-sky-700 dark:text-sky-400"
                                />
                              }
                              className="bg-white dark:bg-slate-700 border-sky-100 dark:border-slate-600 shadow-md hover:bg-sky-50 dark:hover:bg-slate-600"
                            />
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                isLoved
                                  ? removeLovedItem(product.id)
                                  : addLovedItem(product);
                              }}
                              icon={
                                <Heart
                                  size={18}
                                  className={
                                    isLoved
                                      ? "text-red-500 fill-red-500"
                                      : "text-sky-700 dark:text-sky-400"
                                  }
                                />
                              }
                              className="bg-white dark:bg-slate-700 border-sky-100 dark:border-slate-600 shadow-md hover:bg-sky-50 dark:hover:bg-slate-600"
                            />
                          </div>
                        </div>
                      </CardContent>

                      <div className="mt-auto flex flex-col justify-between gap-1 px-3 sm:px-8">
                        <h3 className="text-xs sm:text-lg font-bold text-sky-900 dark:text-sky-300 line-clamp-2 min-h-[2rem] sm:min-h-[3rem]">
                          {productName}
                        </h3>
                        <div className="flex flex-col mb-2">
                          {isB2B && wholesalePrice && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 line-through leading-none">
                              {formatPrice(price)}
                            </p>
                          )}

                          <div className="flex flex-col items-start gap-1 text-green-600 font-black italic text-sm sm:text-base">
                            <p>{formatPrice(finalPrice)}</p>

                            {isB2B && wholesalePrice && (
                              <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase not-italic tracking-normal shadow-sm inline-block">
                                Preferencial
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex text-sky-700 dark:text-sky-400 border-sky-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-700 -left-12" />
        <CarouselNext className="hidden md:flex text-sky-700 dark:text-sky-400 border-sky-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-700 -right-12" />
      </Carousel>
    </div>
  );
};

export default NewArrivals;
