"use client";
import { useGetProductBySlug } from "@/api/getProductBySlug";
import { useParams } from "next/navigation";
import SkeletonProduct from "./components/skeleton-product";
import CarouselProduct from "./components/carousel-product";
import InfoProduct from "@/app/(routes)/product/[productSlug]/components/info-product";
import { ProductImage } from "@/components/product-image";

export default function Page() {
  const params = useParams();

  const productSlug = Array.isArray(params.productSlug)
    ? params.productSlug[0]
    : params.productSlug;

  const { product, loading, error } = useGetProductBySlug(productSlug);

  if (loading) {
    return <SkeletonProduct />;
  }

  if (error || !product) {
    return <p className="text-center py-20">No se encontró el producto</p>;
  }

  const hasImages = Array.isArray(product.images) && product.images.length > 0;

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-32 sm:px-24">
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          {hasImages ? (
            <CarouselProduct images={product.images} />
          ) : (
            <ProductImage
              url={product.images?.[0] || ""}
              className="w-full aspect-square shadow-sm border border-slate-100"
            />
          )}
        </div>

        <div className="sm:px-12">
          <InfoProduct product={product} />
        </div>
      </div>
    </div>
  );
}
