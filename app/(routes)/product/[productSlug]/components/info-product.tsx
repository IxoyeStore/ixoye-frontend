"use client";

import { useState, useEffect } from "react";
import { ProductType } from "@/types/product";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "../../../../../components/ui/button";
import { Heart, Truck, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export type InfoProductProps = {
  product: ProductType;
};

const InfoProduct = ({ product }: InfoProductProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { items, addItem, updateQuantity } = useCart();
  const { lovedItems, addLovedItem, removeLovedItem } = useLovedProducts();
  const [qty, setQty] = useState(1);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const isB2B = user?.profile?.type === "b2b";
  const finalPrice = isB2B && product.wholesalePrice ? product.wholesalePrice : product.price;
  const stock = Number(product.stock) ?? 0;
  const itemInCart = items.find((item) => item.id === product.id);
  const quantityInCart = itemInCart ? itemInCart.quantity || 1 : 0;
  const maxAddable = Math.max(0, stock - quantityInCart);
  const isLoved = lovedItems.some((item) => item.id === product.id);

  const adjustQty = (delta: number) =>
    setQty((q) => Math.min(Math.max(1, q + delta), Math.max(1, maxAddable)));

  const onAddToCart = () => {
    if (maxAddable <= 0) {
      toast.error("Límite de stock alcanzado");
      return;
    }
    if (quantityInCart === 0) {
      addItem(product);
      if (qty > 1) updateQuantity(product.id, qty);
    } else {
      updateQuantity(product.id, quantityInCart + qty);
      toast.success(`Cantidad actualizada a ${quantityInCart + qty}`);
    }
  };

  const onBuyNow = () => {
    if (stock <= 0) return;
    if (quantityInCart === 0) {
      addItem(product);
      if (qty > 1) updateQuantity(product.id, qty);
    }
    router.push("/cart");
  };

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex flex-col gap-3 ${compact ? "" : "mt-2"}`}>
      {stock > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Cantidad
          </span>
          <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
            <button
              onClick={() => adjustQty(-1)}
              disabled={qty <= 1}
              className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              <Minus size={13} strokeWidth={3} />
            </button>
            <span className="w-10 text-center text-sm font-black text-slate-900 dark:text-white select-none">
              {qty}
            </span>
            <button
              onClick={() => adjustQty(1)}
              disabled={qty >= maxAddable}
              className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              <Plus size={13} strokeWidth={3} />
            </button>
          </div>
          {quantityInCart > 0 && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              ({quantityInCart} en carrito)
            </span>
          )}
        </div>
      )}

      <div className="flex flex-row gap-2">
        <Button
          className="flex-[4] py-5 text-sm font-black uppercase tracking-widest bg-[#0055a4] hover:bg-[#003d7a] text-white shadow-md transition-all active:scale-[0.95]"
          onClick={onBuyNow}
          disabled={stock <= 0}
        >
          Comprar Ahora
        </Button>
        <button
          onClick={() => isLoved ? removeLovedItem(product.id) : addLovedItem(product)}
          className={`flex-1 p-3 rounded-xl border-2 transition-all active:scale-90 flex justify-center items-center shadow-sm ${
            isLoved
              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60"
              : "border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 hover:border-red-100 dark:hover:border-red-800"
          }`}
        >
          <Heart className="w-5 h-5" strokeWidth={2.5} fill={isLoved ? "currentColor" : "none"} />
        </button>
      </div>

      <Button
        variant="outline"
        className={`w-full py-5 text-sm font-black uppercase tracking-widest border-2 transition-all active:scale-[0.95] ${
          stock > 0 && maxAddable > 0
            ? "border-[#0055a4] dark:border-sky-500 text-[#0055a4] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-sky-950/40 shadow-sm"
            : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed"
        }`}
        onClick={onAddToCart}
        disabled={stock <= 0 || maxAddable <= 0}
      >
        {stock <= 0 ? "Sin Existencias" : "Añadir al carrito"}
      </Button>

      <p className="text-center text-[18px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
        ¡Envíos gratis a todo Nayarit!
      </p>
    </div>
  );

  return (
    <>
      <div className="px-6 sm:px-0 w-full max-w-full overflow-hidden flex flex-col gap-5">

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-[#001e36] dark:text-white leading-tight uppercase tracking-tight break-words">
          {product.productName}
        </h1>

        {/* Stock badge */}
        <div>
          {stock > 0 ? (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${stock <= 5 ? "bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900 text-orange-600 dark:text-orange-400" : "bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900 text-green-700 dark:text-green-400"}`}>
              <div className={`h-2 w-2 rounded-full animate-pulse ${stock <= 5 ? "bg-orange-500" : "bg-green-600"}`} />
              <p className="text-[10px] font-black uppercase tracking-wider">
                {stock === 1 ? "¡Última unidad!" : stock <= 5 ? `Últimas ${stock} unidades` : "Existencia Disponible"}
              </p>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <p className="text-[10px] font-black uppercase tracking-wider">Agotado temporalmente</p>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1.5">
          {isB2B && product.wholesalePrice && (
            <p className="text-sm text-slate-400 dark:text-slate-500 line-through decoration-red-400/50">
              {formatPrice(product.price)}
            </p>
          )}
          <p className="text-3xl sm:text-4xl font-black tracking-tighter text-green-700 dark:text-green-400">
            {formatPrice(finalPrice)}
          </p>
          {product.freeShipping && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 w-fit">
              <Truck size={14} strokeWidth={3} />
              <span className="text-[11px] font-black uppercase tracking-wide">
                Envío gratis Nayarit
              </span>
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 dark:text-slate-400">
            IVA Incluido / Precio Neto de Venta
          </p>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden sm:block">
          <ActionButtons />
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className={`sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-700 px-4 pt-3 pb-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-transform duration-300 ${footerVisible ? "translate-y-full" : "translate-y-0"}`}>
        <ActionButtons compact />
      </div>
    </>
  );
};

export default InfoProduct;
