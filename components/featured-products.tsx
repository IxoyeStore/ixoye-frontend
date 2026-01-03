/* eslint-disable @next/next/no-img-element */
"use client";

import { useGetFeaturedProducts } from "@/api/useGetFeturedProducts";
import { ResponeType } from "@/types/response";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
} from "./ui/carousel";
import FeaturedSkeleton from "./featuredSkeleton";
import { ProductType } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Expand, ShoppingCart } from "lucide-react";
import IconButton from "./ui/icon-button";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";

const FeaturedProducts = () => {
  const { result, loading }: ResponeType = useGetFeaturedProducts();
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      <h3 className="px-6 text-3xl sm:pb-8">Productos destacados</h3>

      <Carousel>
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading && <FeaturedSkeleton items={3} />}

          {!loading &&
            result?.map((product: ProductType) => {
              if (!product) return null;

              const { id, slug, images, productName, price } = product;

              return (
                <CarouselItem
                  key={id}
                  className="md:basis-1/2 lg:basis-1/3 group"
                >
                  <div className="p-1">
                    <Card className="group flex h-full flex-col py-4 border border-gray-200 shadow-none">
                      <CardContent className="relative flex items-center justify-center px-6 py-2">
                        <div className="relative w-full max-w-[220px] aspect-square overflow-hidden">
                          {images && images.length > 0 ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${images[0].url}`}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src="/placeholder.png"
                              alt="No image"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="absolute w-full px-6 transition duration-200 opacity-0 group-hover:opacity-100">
                          <div className="flex justify-center gap-x-6">
                            <IconButton
                              onClick={() => router.push(`product/${slug}`)}
                              icon={
                                <Expand size={20} className="text-gray-600" />
                              }
                            />
                            <IconButton
                              onClick={() => addItem(product)}
                              icon={
                                <ShoppingCart
                                  size={20}
                                  className="text-gray-600"
                                />
                              }
                            />
                          </div>
                        </div>
                      </CardContent>

                      <div className="mt-auto flex justify-between gap-4 px-8">
                        <h3 className="text-lg font-bold line-clamp-2 min-h-[3rem]">
                          {productName}
                        </h3>
                        <div className="flex items-center text-green-700">
                          <p>${price}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default FeaturedProducts;
