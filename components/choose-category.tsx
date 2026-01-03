/* eslint-disable @next/next/no-img-element */
"use client";

import { useGetCategories } from "@/api/getProducts";
import Link from "next/link";
import { ResponeType } from "@/types/response";
import { CategoryType } from "@/types/category";

const ChooseCategory = () => {
  const { result, loading }: ResponeType = useGetCategories();

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      <h3 className="px-6 pb-4 text-3xl sm:pb-8">Categorías destacadas</h3>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {!loading &&
          result?.map((category: CategoryType) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="
              relative
              w-full
              aspect-[4/5]
              overflow-hidden
              rounded-xl
              shadow-md"
            >
              <img
                src={
                  category.mainImage?.url
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${category.mainImage.url}`
                    : "/placeholder-category.jpg"
                }
                alt={category.categoryName}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />

              <p
                className="absolute bottom-0 w-full py-2 text-lg font-semibold text-center text-white
              bg-sky-700 backdrop-blur-md"
              >
                {category.categoryName}
              </p>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ChooseCategory;
