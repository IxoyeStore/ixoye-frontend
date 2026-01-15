/* eslint-disable @next/next/no-img-element */
"use client";

import ProductImageMiniature from "@/components/shared/product-image-miniature";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { ProductType } from "@/types/product";
import { X, ShoppingCart } from "lucide-react";
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

  return (
    <li className="flex py-6 border-b">
      {/* Usamos el mismo componente de imagen que en CartItem */}
      <ProductImageMiniature slug={product.slug} url={product.images[0].url} />

      <div className="flex justify-between flex-1 px-6">
        <div className="flex flex-col justify-between">
          <div>
            {/* Texto en negro como pediste */}
            <h2 className="text-lg font-bold text-black">
              {product.productName}
            </h2>
            {/* Precio en verde siguiendo la referencia de CartItem */}
            <p className="font-bold text-green-700">
              ${formatPrice(product.price)}
            </p>
          </div>

          {/* Botón de acción principal al estilo Ixoye */}
          <Button
            className="mt-3 rounded-lg bg-[#0055a4] hover:bg-[#003d7a] text-white transition-all w-fit flex gap-2 h-9 px-4 shadow-sm"
            onClick={addToCheckout}
          >
            <ShoppingCart size={16} />
            <span className="text-sm">Mover al carrito</span>
          </Button>
        </div>

        <div className="flex flex-col justify-start items-end">
          {/* Botón X idéntico al de CartItem */}
          <button
            onClick={() => removeLovedItem(product.id)}
            className={cn(
              "rounded-full flex items-center justify-center bg-white border shadow-md p-1.5 hover:scale-110 transition text-rose-700"
            )}
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </li>
  );
};

export default LovedItemProduct;
