/* eslint-disable @typescript-eslint/no-unused-expressions */
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
import { ShoppingCart, Heart } from "lucide-react";
import IconButton from "./ui/icon-button";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";

const FeaturedProducts = () => {
  const { result, loading }: ResponeType = useGetFeaturedProducts();
  const router = useRouter();
  const { addItem } = useCart();
  const { lovedItems, addLovedItem, removeLovedItem } = useLovedProducts();

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      <h3 className="px-6 text-3xl font-bold text-[#003366] sm:pb-8">
        Productos destacados
      </h3>

      <Carousel>
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading && <FeaturedSkeleton items={3} />}

          {!loading &&
            result?.map((product: ProductType) => {
              if (!product) return null;

              const { id, slug, images, productName, price } = product;
              const isLoved = lovedItems.some((item) => item.id === product.id);

              return (
                <CarouselItem
                  key={id}
                  className="md:basis-1/2 lg:basis-1/3 group"
                >
                  <div className="p-2">
                    <Card className="group flex h-full flex-col py-4 border border-sky-100 shadow-sm hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300 bg-white rounded-2xl">
                      <CardContent className="relative flex items-center justify-center px-6 py-2">
                        <div
                          onClick={() => router.push(`/product/${slug}`)}
                          className="relative w-full max-w-[220px] aspect-square overflow-hidden cursor-pointer"
                        >
                          <img
                            src={
                              images && images.length > 0
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${images[0].url}`
                                : "/placeholder.png"
                            }
                            alt={productName}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        <div className="absolute w-full px-6 transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                          <div className="flex justify-center gap-x-4">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                addItem(product);
                              }}
                              icon={
                                <ShoppingCart
                                  size={20}
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
                                  size={20}
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

                      <div className="mt-auto flex justify-between items-start gap-4 px-8">
                        <h3 className="text-lg font-bold text-sky-900 line-clamp-2 min-h-[3rem]">
                          {productName}
                        </h3>
                        <div className="flex items-center text-green-600 ">
                          <p>${price}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
        </CarouselContent>

        <CarouselPrevious className="text-sky-700 border-sky-200 hover:bg-sky-50" />
        <CarouselNext className="hidden sm:flex text-sky-700 border-sky-200 hover:bg-sky-50" />
      </Carousel>
    </div>
  );
};

export default FeaturedProducts;
