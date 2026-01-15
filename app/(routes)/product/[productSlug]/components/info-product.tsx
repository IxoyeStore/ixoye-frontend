"use client";

import { ProductType } from "@/types/product";
import { Separator } from "../../../../../components/ui/separator";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "../../../../../components/ui/button";
import { Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { toast } from "sonner";

export type InfoProductProps = {
  product: ProductType;
};

const InfoProduct = (props: InfoProductProps) => {
  const { product } = props;
  const { items, addItem } = useCart();
  const { addLovedItem } = useLovedProducts();
  const stock = Number(product.stock) ?? 0;
  const itemInCart = items.find((item) => item.id === product.id);

  const quantityInCart = itemInCart ? itemInCart.quantity || 1 : 0;

  const onAddToCart = () => {
    if (quantityInCart >= stock) {
      toast.error("Límite de stock alcanzado", {
        description:
          "No puedes agregar más unidades de las que hay disponibles.",
      });
      return;
    }
    addItem(product);
  };

  const onAddWishlist = () => {
    addLovedItem(product);
  };

  return (
    <div className="px-6">
      <div className="justify-between mb-3 sm:flex">
        <h1 className="text-2xl font-bold">{product.productName}</h1>
      </div>

      <Separator className="my-4" />

      <div className="my-4 min-h-[24px]">
        {stock > 5 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-700" />
            <p className="text-sm font-semibold text-green-800">Disponible</p>
          </div>
        )}

        {stock > 0 && stock <= 5 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
            <p className="text-sm font-bold text-orange-600">
              {stock} unidades disponibles
            </p>
          </div>
        )}

        {stock <= 0 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-sm font-bold text-red-600">
              Agotado temporalmente
            </p>
          </div>
        )}
      </div>

      <p className="whitespace-pre-line text-slate-600">
        {product.description}
      </p>
      <Separator className="my-4" />
      <p className="my-4 text-2xl font-semibold text-green-700">
        {formatPrice(product.price)}
      </p>

      <div className="flex items-center gap-5 mt-6">
        <Button
          className={`flex-1 max-w-[420px] text-white ${
            stock > 0 && quantityInCart < stock
              ? "bg-sky-700 hover:bg-sky-800"
              : "bg-slate-300"
          }`}
          onClick={onAddToCart}
          disabled={stock <= 0 || quantityInCart >= stock}
        >
          {stock <= 0
            ? "Agotado"
            : quantityInCart >= stock
            ? "Agotado"
            : "Comprar"}
        </Button>

        <Heart
          width={30}
          strokeWidth={1}
          className="transition duration-300 text-sky-700 cursor-pointer hover:fill-sky-700 active:scale-125"
          onClick={onAddWishlist}
        />
      </div>
    </div>
  );
};

export default InfoProduct;
