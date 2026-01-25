/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/formatPrice";
import CartItem from "./components/cart-item";
import { makePaymentReques } from "@/api/payment";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export default function Page() {
  const { items, removeAll } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const validItems = items.filter(Boolean);
  const hasItems = validItems.length > 0;
  const isB2B = user?.profile?.type === "b2b";

  const totalPrice = validItems.reduce((total, item) => {
    const priceToPay =
      isB2B && item.wholesalePrice ? item.wholesalePrice : item.price;
    return total + priceToPay * (item.quantity || 1);
  }, 0);

  const totalOriginalPrice = validItems.reduce((total, item) => {
    return total + item.price * (item.quantity || 1);
  }, 0);

  const totalSavings = totalOriginalPrice - totalPrice;

  // --- NUEVA LÓGICA DE PAGO (REDIRECCIÓN) ---
  const handleCheckoutClick = async () => {
    if (!user || !user.jwt) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    setLoading(true);

    try {
      const payload = {
        data: {
          email: user.email,
          phone: user.profile?.phone || "0000000000",
          products: validItems.map((item) => ({
            id: item.id,
            quantity: item.quantity || 1,
          })),
        },
      };

      // 1. Llamamos a tu API de Strapi (la que configuramos con openpay.checkouts.create)
      const res = await makePaymentReques.post("/api/orders", payload, {
        headers: {
          Authorization: `Bearer ${user.jwt.trim()}`,
        },
      });

      // 2. Si el backend nos da la URL de Openpay, redirigimos al usuario
      if (res.data?.data?.url) {
        toast.success("Redirigiendo al procesador de pago...");
        // Guardamos en localStorage o similar si necesitamos limpiar el carrito después
        // Aunque lo ideal es limpiarlo en la página de /success
        window.location.href = res.data.data.url;
      } else {
        throw new Error("No se recibió la URL de pago.");
      }
    } catch (error: any) {
      console.error("Error en el checkout:", error);
      toast.error(
        error.response?.data?.error?.message ||
          "Error al iniciar el proceso de pago"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl px-4 py-16 mx-auto">
      <h1 className="mb-8 text-4xl font-black text-sky-950 uppercase italic tracking-tighter">
        Carrito de compras
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-4">
          {!hasItems && (
            <div className="space-y-4">
              <p className="text-sky-700 font-bold italic">
                No hay productos en el carrito.
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/category")}
                className="rounded-full border-sky-200 text-sky-800 font-black uppercase text-[10px] px-6 py-6"
              >
                Explorar productos
              </Button>
            </div>
          )}

          <ul className="divide-y divide-slate-100">
            {validItems.map((item) => (
              <CartItem key={item.id} product={item} />
            ))}
          </ul>
        </div>

        {hasItems && (
          <div className="max-w-xl">
            <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-sky-100/30">
              <p className="mb-4 text-xs font-black text-sky-950 uppercase tracking-widest">
                Resumen de pedido
              </p>
              <Separator className="bg-slate-100" />

              <div className="space-y-4 my-6">
                {isB2B && totalSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">
                      Precio original
                    </p>
                    <p className="text-base font-bold text-slate-400 line-through decoration-red-400/40">
                      {formatPrice(totalOriginalPrice)}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">
                    Total del pedido
                  </p>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600 tracking-tighter italic">
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                disabled={loading}
                className="w-full rounded-full bg-sky-800 hover:bg-sky-900 text-white font-black uppercase text-[11px] tracking-[0.2em] py-7 shadow-lg transition-transform active:scale-95"
                onClick={handleCheckoutClick}
              >
                {loading ? "Preparando pago..." : "Ir a pagar"}
              </Button>

              <p className="mt-4 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                🔒 Pago seguro con Openpay
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
