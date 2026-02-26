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
    <div className="max-w-7xl py-4 mx-auto sm:py-16 sm:px-24">
      <h3 className="px-6 text-2xl sm:text-3xl font-bold text-[#003366] mb-4 sm:pb-8 italic uppercase tracking-tighter text-center">
        Categorías destacadas
      </h3>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading &&
            [1, 2, 3, 4].map((i) => (
              <CarouselItem
                key={i}
                className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="p-1">
                  <div className="w-full aspect-[4/5] bg-gray-100 animate-pulse rounded-xl" />
                </div>
              </CarouselItem>
            ))}

          {!loading &&
            result?.map((category: CategoryType) => (
              <CarouselItem
                key={category.id}
                className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
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

        <CarouselPrevious className="hidden md:flex text-sky-700 border-sky-200 hover:bg-sky-50 -left-12" />
        <CarouselNext className="hidden md:flex text-sky-700 border-sky-200 hover:bg-sky-50 -right-12" />
      </Carousel>
    </div>
  );
};

export default ChooseCategory;
