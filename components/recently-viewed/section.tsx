"use client";
import Link from "next/link";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/formatPrice";
import { ProductImage } from "@/components/product-image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Props {
  excludeId?: number;
}

export default function RecentlyViewedSection({ excludeId }: Props) {
  const { products, hydrated } = useRecentlyViewed();
  const { user } = useAuth();
  const isB2B = user?.profile?.type === "b2b";

  const visible = excludeId ? products.filter((p) => p.id !== excludeId) : products;

  if (!hydrated || visible.length <= 3) return null;

  return (
    <div className="max-w-7xl py-4 mx-auto sm:py-16 sm:px-24 px-2">
      <h3 className="px-4 text-2xl sm:text-3xl font-bold text-[#003366] mb-4 sm:pb-8 tracking-tighter text-left">
        Vistos recientemente
      </h3>
      <Carousel className="w-full" opts={{ dragFree: true, loop: false }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {visible.map((product) => {
            const displayPrice =
              isB2B && product.wholesalePrice && product.wholesalePrice > 0
                ? product.wholesalePrice
                : product.price;
            return (
              <CarouselItem
                key={product.id}
                className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4 group"
              >
                <div className="h-full">
                  <Card className="group flex h-full flex-col py-3 sm:py-4 border border-sky-100 shadow-sm hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300 bg-white rounded-2xl">
                    <CardContent className="relative flex items-center justify-center px-2 sm:px-6 py-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="relative w-full aspect-square overflow-hidden block"
                      >
                        <ProductImage
                          url={product.image}
                          alt={product.productName}
                          className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                      </Link>
                    </CardContent>
                    <div className="mt-auto flex flex-col justify-between gap-1 px-3 sm:px-8">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="text-xs sm:text-lg font-bold text-sky-900 line-clamp-2 min-h-[2rem] sm:min-h-[3rem]">
                          {product.productName}
                        </h3>
                      </Link>
                      <div className="flex flex-col mb-2">
                        {isB2B && product.wholesalePrice && product.wholesalePrice > 0 && (
                          <p className="text-[10px] text-slate-400 line-through leading-none">
                            {formatPrice(product.price)}
                          </p>
                        )}
                        <div className="flex flex-col items-start gap-1 text-green-600 font-black italic text-sm sm:text-base">
                          <p>{formatPrice(displayPrice)}</p>
                          {isB2B && product.wholesalePrice && product.wholesalePrice > 0 && (
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
      </Carousel>
    </div>
  );
}
