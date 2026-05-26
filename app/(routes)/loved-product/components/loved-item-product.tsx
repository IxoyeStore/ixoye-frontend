/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { ProductType } from "@/types/product";
import { X, ShoppingCart, PackageX } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

interface LovedItemProductProps {
  product: ProductType;
}

const LovedItemProduct = ({ product }: LovedItemProductProps) => {
  const { removeLovedItem } = useLovedProducts();
  const { addItem } = useCart();
  const { user } = useAuth();

  const isB2B = user?.profile?.type === "b2b";
  const hasWholesalePrice = isB2B && product.wholesalePrice && product.wholesalePrice > 0;
  const displayPrice = hasWholesalePrice ? product.wholesalePrice : product.price;
  const outOfStock = !product.stock || product.stock <= 0;

  const addToCheckout = () => {
    addItem(product);
    removeLovedItem(product.id);
  };

  return (
    <div className="flex p-4 border border-slate-200 rounded-xl items-center hover:shadow-md transition-all bg-white relative group">
      <div className="shrink-0">
        <Link href={`/product/${product.slug}`}>
          <ProductImage
            url={product.images?.[0]}
            alt={product.productName}
            className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg border border-slate-50 shadow-sm"
          />
        </Link>
      </div>

      <div className="flex flex-col justify-between flex-1 px-4 min-h-[110px]">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm font-bold text-[#001e36] hover:text-[#0055a4] transition-colors line-clamp-2 leading-snug">
              {product.productName}
            </h2>
          </Link>
          {hasWholesalePrice && (
            <p className="text-xs text-slate-400 line-through">
              {formatPrice(product.price)}
            </p>
          )}
          <p className={`font-bold mt-1 text-base ${outOfStock ? "text-slate-400" : "text-green-700"}`}>
            {formatPrice(displayPrice!)}
          </p>
        </div>

        {outOfStock ? (
          <div className="mt-2 flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 h-8 w-full md:w-fit">
            <PackageX size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Agotado</span>
          </div>
        ) : (
          <Button
            className="mt-2 rounded-lg bg-[#0055a4] hover:bg-[#003d7a] text-white transition-all w-full md:w-fit flex gap-2 h-8 px-3 shadow-sm"
            onClick={addToCheckout}
          >
            <ShoppingCart size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Mover al carrito
            </span>
          </Button>
        )}
      </div>

      <button
        onClick={() => removeLovedItem(product.id)}
        className={cn(
          "absolute top-2 right-2 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm p-2 hover:scale-110 transition text-rose-700 hover:bg-rose-50",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100",
        )}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default LovedItemProduct;
