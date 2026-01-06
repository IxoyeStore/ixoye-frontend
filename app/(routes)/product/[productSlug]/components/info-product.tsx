"use client";

import { ProductType } from "@/types/product";
import { Separator } from "../../../../../components/ui/separator";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "../../../../../components/ui/button";
import { Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";

export type InfoProductProps = {
  product: ProductType;
};

const InfoProduct = (props: InfoProductProps) => {
  const { product } = props;
  const { addItem } = useCart();
  const { addLovedItem } = useLovedProducts();

  return (
    <div className="px-6">
      <div className="justify-between mb-3 sm:flex">
        <h1 className="text-2xl">{product.productName}</h1>
      </div>
      <Separator className="my-4" />
      <p className="whitespace-pre-line">{product.description}</p>
      <Separator className="my-4" />
      <p className="my-4 text-2xl">{formatPrice(product.price)}</p>
      <div className="flex items-center gap-5">
        <Button
          className="flex-1 max-w-[420px]"
          onClick={() => addItem(product)}
        >
          Comprar
        </Button>
        <Heart
          width={30}
          strokeWidth={1}
          className="transition duration-300 cursor-pointer hover:fill-black"
          onClick={() => addLovedItem(product)}
        />
      </div>
    </div>
  );
};

export default InfoProduct;
