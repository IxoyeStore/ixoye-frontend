/* eslint-disable @next/next/no-img-element */
"use client";

import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { useGetCategoryProduct } from "@/api/getCategoryProduct";
import SkeletonSchema from "@/components/skeletonSchema";
import ProductCard from "@/app/(routes)/category/[categorySlug]/components/product-card";
import { ProductType } from "@/types/product";
import { useState } from "react";
import { useGetCategoryWithFilters } from "@/api/getCategoryWithFilters";

export default function Page() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { result, loading, error } = useGetCategoryProduct(categorySlug);
  const [filterOrigin, setFilterOrigin] = useState("");

  const { category, loading: loadingCategory } =
    useGetCategoryWithFilters(categorySlug);

  const filteredProducts =
    result !== null &&
    !loading &&
    (filterOrigin === ""
      ? result
      : result.filter(
          (product: ProductType) => product.brand === filterOrigin,
        ));

  if (error)
    return (
      <div className="max-w-6xl py-20 mx-auto text-center">
        <p className="text-red-500 font-semibold bg-red-50 inline-block px-4 py-2 rounded-lg border border-red-100">
          {error}
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      {loadingCategory ? (
        <div className="h-10 w-64 bg-sky-100 animate-pulse rounded-md mb-4" />
      ) : (
        category?.categoryName && (
          <h1 className="text-3xl font-bold text-sky-900">
            {category.categoryName}
          </h1>
        )
      )}

      <Separator className="my-4 bg-sky-100" />

      <div className="w-full">
        <div className="grid w-full gap-3 mt-8 grid-cols-2 md:grid-cols-3 md:gap-10">
          {" "}
          {loading && (
            <>
              <SkeletonSchema grid={3} />
              <SkeletonSchema grid={3} />
            </>
          )}
          {!loading && filteredProducts && filteredProducts.length === 0 && (
            <p className="col-span-full text-center text-sky-800/60 mt-15 font-medium">
              No se encontraron productos en esta categoría.
            </p>
          )}
          {!loading &&
            filteredProducts &&
            filteredProducts.length > 0 &&
            filteredProducts.map((product: ProductType) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>
    </div>
  );
}
