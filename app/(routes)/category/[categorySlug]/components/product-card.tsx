/* eslint-disable @next/next/no-img-element */
import { ProductType } from "@/types/product";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../../../../components/ui/carousel";
import { ShoppingCart, Heart } from "lucide-react";
import IconButton from "@/components/ui/icon-button";
import { formatPrice } from "@/lib/formatPrice";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

type ProductCardProps = {
  product: ProductType;
};

interface AuthUserWithProfile {
  id: number;
  email: string;
  profile?: {
    type: "b2c" | "b2b";
    firstName: string;
    lastName: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { lovedItems, addLovedItem, removeLovedItem } = useLovedProducts();
  const { user } = useAuth();

  const [imageError, setImageError] = useState(false);

  const authUser = user as AuthUserWithProfile | null;

  const hasImages = Array.isArray(product.images) && product.images.length > 0;
  const isLoved = lovedItems.some((item) => item.id === product.id);

  const isB2B = authUser?.profile?.type === "b2b";
  const hasWholesalePrice =
    isB2B && product.wholesalePrice && product.wholesalePrice > 0;

  const displayPrice = hasWholesalePrice
    ? product.wholesalePrice
    : product.price;

  return (
    <div className="relative p-2 transition-all duration-200 rounded-lg hover:shadow-md group border border-transparent hover:border-slate-100 flex flex-col h-full">
      <div className="relative rounded-xl overflow-hidden">
        {product.brand && (
          <div className="absolute top-2 right-2 z-20 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-sm text-[#0055a4] text-[9px] font-black px-2 py-1 rounded shadow-sm border border-slate-100 uppercase">
              {product.brand}
            </span>
          </div>
        )}

        <Link href={`/product/${product.slug}`}>
          {hasImages && !imageError ? (
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {product.images.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square">
                      <Image
                        src={imageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <ProductImage url={undefined} className="aspect-square w-full" />
          )}
        </Link>

        <div className="absolute w-full px-4 transition duration-300 opacity-0 group-hover:opacity-100 bottom-4 left-0 z-10">
          <div className="flex justify-center gap-x-4">
            <IconButton
              onClick={() => addItem(product)}
              icon={<ShoppingCart size={18} className="text-sky-700" />}
            />
            <IconButton
              onClick={() =>
                isLoved ? removeLovedItem(product.id) : addLovedItem(product)
              }
              icon={
                <Heart
                  size={18}
                  className={
                    isLoved ? "text-red-500 fill-red-500" : "text-sky-700"
                  }
                />
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col flex-grow text-center">
        <Link href={`/product/${product.slug}`}>
          <p className="text-sm font-bold text-sky-900 line-clamp-2 min-h-[40px] flex items-center justify-center">
            {product.productName}
          </p>
        </Link>

        <div className="mt-auto pt-2 flex flex-col items-center">
          {hasWholesalePrice && (
            <p className="text-xs text-slate-400 line-through">
              {formatPrice(product.price)}
            </p>
          )}

          <p className="font-bold text-green-600 text-lg">
            {formatPrice(displayPrice!)}
          </p>

          {hasWholesalePrice && (
            <span className="text-[10px] bg-sky-50 text-[#0071b1] px-2 py-0.5 rounded-full font-bold uppercase mt-1 border border-sky-100">
              Precio preferencial
            </span>
          )}

          {product.productType && (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
              {product.productType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
