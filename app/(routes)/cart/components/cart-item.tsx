/* eslint-disable @next/next/no-img-element */
"use client";

import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/formatPrice";
import { ProductType } from "@/types/product";
import { X, Plus, Minus } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

interface CartItemProps {
  product: ProductType;
}

const CartItem = ({ product }: CartItemProps) => {
  const { removeItem, updateQuantity } = useCart();
  const { user } = useAuth();

  const quantity = product.quantity || 1;
  const stock = product.stock ?? 0;

  const isB2B = user?.profile?.type === "b2b";

  const priceB2C = product.price;
  const priceToPay =
    isB2B && product.wholesalePrice ? product.wholesalePrice : product.price;

  const showTachado =
    isB2B && product.wholesalePrice && product.wholesalePrice < product.price;

  return (
    <li className="flex py-6 border-b dark:border-slate-700">
      <Link
        href={`/product/${product.slug}`}
        className="cursor-pointer shrink-0"
      >
        <ProductImage
          url={product.images?.[0]}
          alt={product.productName}
          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"
        />
      </Link>

      <div className="flex justify-between flex-1 px-4 sm:px-6">
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#001e36] dark:text-white line-clamp-2 uppercase leading-tight">
              {product.productName}
            </h2>

            <div className="flex flex-col mt-1">
              {showTachado && (
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 line-through decoration-red-400/60 mb-0.5">
                  {formatPrice(priceB2C)}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <p className="font-bold text-green-600 dark:text-green-400">
                  {formatPrice(priceToPay)}
                </p>

                {showTachado && (
                  <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase self-start sm:self-auto shadow-sm">
                    Preferencial
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 border dark:border-slate-600 w-fit rounded-lg p-1 bg-white dark:bg-slate-800 shadow-sm">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white rounded-md disabled:opacity-30 transition"
            >
              <Minus size={15} />
            </button>
            <span className="font-bold text-sm min-w-[20px] text-center dark:text-white">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= stock}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white rounded-md disabled:opacity-30"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end ml-2">
          <button
            onClick={() => removeItem(product.id)}
            className="rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border dark:border-slate-600 shadow-md p-1.5 hover:scale-110 transition text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <X size={20} />
          </button>

          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest">
              Subtotal
            </p>
            <p className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">
              {formatPrice(priceToPay * quantity)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
