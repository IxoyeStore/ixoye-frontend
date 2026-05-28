/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useGetFeaturedProducts } from "@/api/useGetFeturedProducts";
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
import { ShoppingCart, Heart, PackageX } from "lucide-react";
import IconButton from "./ui/icon-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { ProductImage } from "@/components/product-image";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/formatPrice";

const AUTOPLAY_MS = 5000;

const FeaturedProducts = () => {
  const { result, loading, error }: ResponeType = useGetFeaturedProducts();
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
    return (
      <div className="max-w-7xl py-4 mx-auto sm:py-16 sm:px-24 px-2">
        <h3 className="px-4 text-2xl sm:text-3xl font-bold text-[#003366] mb-4 sm:pb-8 uppercase tracking-tighter text-center">
          Productos destacados
        </h3>
        <div className="flex flex-col items-center justify-center gap-4 py-14 border border-dashed border-sky-100 rounded-2xl bg-sky-50/40">
          <PackageX className="w-10 h-10 text-sky-300" strokeWidth={1.5} />
          <p className="text-2xl font-black uppercase tracking-tighter italic text-slate-300 text-center px-4">
            No se pudieron cargar los productos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl py-4 mx-auto sm:py-16 sm:px-24 px-2">
      <h3 className="px-4 text-2xl sm:text-3xl font-bold text-[#003366] mb-4 sm:pb-8 italic uppercase tracking-tighter text-center">
        Productos destacados
      </h3>

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

              const { id, slug, images, productName, price, wholesalePrice } =
                product;
              const isLoved = lovedItems.some((item) => item.id === product.id);
              const isB2B = user?.profile?.type === "b2b";
              const finalPrice =
                isB2B && wholesalePrice ? wholesalePrice : price;

              return (
                <CarouselItem
                  key={id}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4 group"
                >
                  <div className="h-full">
                    <Card className="group flex h-full flex-col py-3 sm:py-4 border border-sky-100 shadow-sm hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300 bg-white rounded-2xl">
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
                                  className="text-sky-700"
                                />
                              }
                              className="bg-white border-sky-100 shadow-md hover:bg-sky-50"
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
                                      : "text-sky-700"
                                  }
                                />
                              }
                              className="bg-white border-sky-100 shadow-md hover:bg-sky-50"
                            />
                          </div>
                        </div>
                      </CardContent>

                      <div className="mt-auto flex flex-col justify-between gap-1 px-3 sm:px-8">
                        <h3 className="text-xs sm:text-lg font-bold text-sky-900 line-clamp-2 min-h-[2rem] sm:min-h-[3rem]">
                          {productName}
                        </h3>
                        {/* Sección de Precio Dinámico */}
                        <div className="flex flex-col mb-2">
                          {isB2B && wholesalePrice && (
                            <p className="text-[10px] text-slate-400 line-through leading-none">
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

        <CarouselPrevious className="hidden md:flex text-sky-700 border-sky-200 hover:bg-sky-50 -left-12" />
        <CarouselNext className="hidden md:flex text-sky-700 border-sky-200 hover:bg-sky-50 -right-12" />
      </Carousel>
    </div>
  );
};

export default FeaturedProducts;
