/* eslint-disable @next/next/no-img-element */
import { ProductType } from "@/types/product";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../../../../components/ui/carousel";
import { ShoppingCart, Heart, Hash } from "lucide-react";
import IconButton from "@/components/ui/icon-button";
import { formatPrice } from "@/lib/formatPrice";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";

type ProductCardProps = {
  product: ProductType;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { lovedItems, addLovedItem, removeLovedItem } = useLovedProducts();

  const hasImages = product.images && product.images.length > 0;
  const isLoved = lovedItems.some((item) => item.id === product.id);

  return (
    <div className="relative p-2 transition-all duration-200 rounded-lg hover:shadow-md group border border-transparent hover:border-slate-100 flex flex-col h-full">
      {/* Contenedor de Imagen + Botones */}
      <div className="relative rounded-xl overflow-hidden">
        {product.brand && (
          <div className="absolute top-2 right-2 z-20 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-sm text-[#0055a4] text-[9px] font-black px-2 py-1 rounded shadow-sm border border-slate-100 uppercase">
              {product.brand}
            </span>
          </div>
        )}

        <Link href={`/product/${product.slug}`}>
          {hasImages ? (
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {product.images.map((image) => (
                  <CarouselItem key={image.id}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${image.url}`}
                      alt={product.productName}
                      className="aspect-square object-cover w-full"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <ProductImage url={undefined} className="aspect-square w-full" />
          )}
        </Link>

        {/* Botones de acción flotantes (Ahora relativos a la imagen) */}
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

      {/* Información del Producto */}
      <div className="mt-3 flex flex-col flex-grow text-center">
        <Link href={`/product/${product.slug}`}>
          <p className="text-sm font-bold text-sky-900 line-clamp-2 min-h-[40px] flex items-center justify-center">
            {product.productName}
          </p>
        </Link>

        <div className="mt-auto pt-2">
          <p className="font-bold text-green-600">
            {formatPrice(product.price)}
          </p>

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
