/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/formatPrice";
import CartItem from "./components/cart-item";
import { makePaymentReques } from "@/api/payment";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { ShoppingBasket, ArrowRight } from "lucide-react";
import Link from "next/link";
import router from "next/router";
import cpMexico from "@/lib/cp-mexico.json";

export default function Page() {
  const { items, removeAll } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<{
    cost: number;
    label: string;
  } | null>(null);
  const [userCP, setUserCP] = useState("");

  const validItems = items.filter(Boolean);
  const hasItems = validItems.length > 0;
  const isB2B = user?.profile?.type === "b2b";

  const totalPrice = validItems.reduce((total, item) => {
    const priceToPay =
      isB2B && item.wholesalePrice ? item.wholesalePrice : item.price;
    return total + priceToPay * (item.quantity || 1);
  }, 0);

  const subtotal = totalPrice / 1.16;
  const iva = totalPrice - subtotal;

  const totalOriginalPrice = validItems.reduce((total, item) => {
    return total + item.price * (item.quantity || 1);
  }, 0);

  const totalSavings = totalOriginalPrice - totalPrice;

  const handleCheckoutClick = async () => {
    if (!user || !user.jwt) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        window.location.pathname,
      )}`;
      return;
    }
    if (!userCP) {
      toast.error(
        "Por favor, configura una dirección de envío en tu perfil antes de pagar.",
      );
      router.push("/profile/edit?new=true");
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
          shippingPrice: shippingQuote?.cost || 0,
          shippingLabel: shippingQuote?.label || "Envío Estándar",
          postalCode: userCP,
          total: finalTotal,
        },
      };

      const res = await makePaymentReques.post("/api/orders", payload, {
        headers: {
          Authorization: `Bearer ${user.jwt.trim()}`,
        },
      });

      if (res.data?.data?.url) {
        toast.success("Redirigiendo al procesador de pago...");

        validItems.forEach((item) => {
          fetch("/api/metrics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: item.id, event: "purchase" }),
          }).catch(() => {});
        });

        window.location.href = res.data.data.url;
      } else {
        throw new Error("No se recibió la URL de pago.");
      }
    } catch (error: any) {
      console.error("Error en el checkout:", error);
      toast.error(
        error.response?.data?.error?.message ||
          "Error al iniciar el proceso de pago",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (user?.id && user?.jwt) {
        try {
          const res = await fetch(
            `https://ixoye-backend-production.up.railway.app/api/addresses?filters[users_permissions_user][id][$eq]=${user.id}&filters[isDefault][$eq]=true`,
            { headers: { Authorization: `Bearer ${user.jwt}` } },
          );
          const json = await res.json();
          if (json.data?.[0]) {
            const cp = json.data[0].postalCode;
            setUserCP(cp);
            calculateShipping(cp);
          }
        } catch (e) {
          console.error("Error cargando CP:", e);
        }
      }
    };
    fetchDefaultAddress();
  }, [user]);

  const calculateShipping = (cp: string) => {
    if (cp.length !== 5) return;

    const cacheKey = "shipping_cache";
    const cache = localStorage.getItem(cacheKey);

    if (cache) {
      const parsedCache = JSON.parse(cache);
      if (parsedCache.cp === cp) {
        setShippingQuote({ cost: parsedCache.cost, label: parsedCache.label });
        return;
      }
    }

    const entry = (cpMexico as Record<string, { e: string; m: string }>)[cp];
    if (!entry) {
      setShippingQuote({ cost: 250, label: "Envío Nacional" });
      return;
    }

    let cost = 0;
    let label = "Entrega Local";

    if (entry.e !== "Nayarit") {
      cost = -1;
      label = "No disponible";
    }

    const newQuote = { cost, label };
    setShippingQuote(newQuote);

    localStorage.setItem(
      cacheKey,
      JSON.stringify({ cp, ...newQuote }),
    );
  };

  const finalTotal = totalPrice + (shippingQuote?.cost || 0);

  return (
    <div className="max-w-6xl px-4 py-16 mx-auto min-h-[75vh]">
      <h1 className="mb-8 text-4xl font-black text-sky-950 dark:text-sky-300 uppercase italic tracking-tighter">
        Carrito de compras
      </h1>

      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-center bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-slate-100/50 dark:ring-slate-800">
            <ShoppingBasket size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-black uppercase text-xs tracking-widest mb-2">
            Tu carrito está vacío
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm italic mb-8 max-w-xs mx-auto">
            Parece que aún no has agregado productos a tu pedido.
          </p>
          <Link href="/category">
            <Button className="rounded-full bg-sky-800 hover:bg-sky-950 text-white font-black uppercase text-[10px] tracking-[0.2em] px-10 py-7 shadow-xl shadow-sky-900/20 transition-all hover:scale-105 active:scale-95 flex gap-2">
              Explorar productos
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-10 animate-in fade-in duration-500">
          <div className="flex flex-col gap-4">
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {validItems.map((item) => (
                <CartItem key={item.id} product={item} />
              ))}
            </ul>
          </div>

          <div className="max-w-xl">
            <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-sky-100/30 dark:shadow-none sticky top-24">
              <p className="mb-4 text-xs font-black text-sky-950 dark:text-sky-300 uppercase tracking-widest">
                Resumen de pedido
              </p>
              <Separator className="bg-slate-100 dark:bg-slate-700" />

              <div className="space-y-4 my-6">
                {isB2B && totalSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">
                      Precio original
                    </p>
                    <p className="text-base font-bold text-slate-400 dark:text-slate-500 line-through decoration-red-400/40">
                      {formatPrice(totalOriginalPrice)}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Subtotal
                  </p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {formatPrice(subtotal)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    IVA (16%)
                  </p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {formatPrice(iva)}
                  </p>
                </div>

                {/* SECCIÓN DE ENVÍO */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex flex-col">
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                      Envío {shippingQuote ? `(${shippingQuote.label})` : ""}
                    </p>
                    {!userCP && (
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-tight italic">
                        Configura tu dirección en el perfil
                      </p>
                    )}
                    {shippingQuote?.cost === -1 && (
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-tight italic">
                        Comunícate con nosotros
                      </p>
                    )}
                  </div>
                  <p
                    className={`text-sm font-black ${shippingQuote?.cost === 0 ? "text-green-600 dark:text-green-400" : shippingQuote?.cost === -1 ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    {shippingQuote
                      ? shippingQuote.cost === 0
                        ? "¡GRATIS!"
                        : shippingQuote.cost === -1
                          ? "No disponible"
                          : formatPrice(shippingQuote.cost)
                      : "---"}
                  </p>
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-700" />

                <div className="flex justify-between items-center">
                  <p className="text-sky-950 dark:text-sky-300 font-black uppercase text-[10px]">
                    Total del pedido
                  </p>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600 dark:text-green-400 tracking-tighter italic">
                      {/* Usamos finalTotal aquí para que sume el envío */}
                      {formatPrice(totalPrice + (shippingQuote?.cost || 0))}
                    </p>
                    <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                      IVA Incluido
                    </p>
                  </div>
                </div>
              </div>

              <Button
                disabled={loading}
                className="w-full rounded-full bg-sky-800 hover:bg-sky-900 text-white font-black uppercase text-[11px] tracking-[0.2em] py-7 shadow-lg transition-transform active:scale-95"
                onClick={handleCheckoutClick}
              >
                {loading ? "Preparando pago..." : "Realizar pedido y pagar"}
              </Button>

              <p className="mt-4 text-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                🔒 Pago seguro con Openpay by BBVA
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
