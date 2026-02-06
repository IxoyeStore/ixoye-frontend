/* eslint-disable @next/next/no-img-element */
"use client";

import { useGetCategories } from "@/api/getProducts";
import Link from "next/link";
import { ResponeType } from "@/types/response";
import { CategoryType } from "@/types/category";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

const ChooseCategory = () => {
  const { result, loading }: ResponeType = useGetCategories();

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      <h3 className="px-6 text-2xl sm:text-3xl font-bold text-[#003366] mb-4 sm:pb-8 italic uppercase tracking-tighter">
        Categorías destacadas
      </h3>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading && (
            <div className="flex px-4 gap-2 w-full">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="basis-1/2 sm:basis-1/3 aspect-[4/5] bg-gray-100 animate-pulse rounded-xl"
                />
              ))}
            </div>
          )}

          {!loading &&
            result?.map((category: CategoryType) => (
              <CarouselItem
                key={category.id}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <Link
                    href={`/category/${category.slug}`}
                    className="
                      relative
                      flex
                      w-full
                      aspect-[4/5]
                      overflow-hidden
                      rounded-xl
                      shadow-md
                      group"
                  >
                    <img
                      src={
                        category.mainImage?.url
                          ? `${category.mainImage.url}`
                          : "/placeholder-category.jpg"
                      }
                      alt={category.categoryName}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    <p
                      className="absolute bottom-0 w-full py-2 text-sm sm:text-lg font-bold text-center text-white
                    bg-[#003366]/90 backdrop-blur-sm"
                    >
                      {category.categoryName}
                    </p>
                  </Link>
                </div>
              </CarouselItem>
            ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex text-sky-700 border-sky-200" />
        <CarouselNext className="hidden md:flex text-sky-700 border-sky-200" />
      </Carousel>
    </div>
  );
};

export default ChooseCategory;
