/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { ProductType } from "@/types/product";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface LovedItemProductProps {
  product: ProductType;
}

const LovedItemProduct = (props: LovedItemProductProps) => {
  const { product } = props;
  const router = useRouter();
  const { removeLovedItem } = useLovedProducts();
  const { addItem } = useCart();
  const addToCheckout = () => {
    addItem(product);
    removeLovedItem(product.id);
  };

  const imageUrl = product.images?.[0]?.url || "";

  return (
    <li className="flex py-6 border-b">
      <div onClick={() => router.push(`/product/${product.slug}`)}>
        <img
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`}
          alt={product.productName || "Producto"}
          className="w-24 h-24 overflow-hidden rounded-md sm:w-auto sm:h-32"
        />
      </div>
      <div className="flex justify-between flex-1 px-6">
        <div>
          <h2 className="text-lg font-bold">{product.productName}</h2>
          <p className="font-bold">{formatPrice(product.price)}</p>
          <div className="flex items-center justify-between gap-3">
            {/* <p className="px-2 py-1 text-xs text-white bg-black rounded-full dark:bg-white dark:text-white w-fit">
              
            </p> */}
          </div>
          <Button className="mt-5 rounded-full" onClick={addToCheckout}>
            Agregar al carrito
          </Button>
        </div>
        <div>
          <button
            className={cn(
              "rounded-full flex items-center justify-center bg-white border shadow-md p-1 hover-scale-110 transition"
            )}
          >
            <X size={20} onClick={() => removeLovedItem(product.id)} />
          </button>
        </div>
      </div>
    </li>
  );
};

export default LovedItemProduct;
