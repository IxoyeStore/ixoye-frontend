/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/formatPrice";
import CartItem from "./components/cart-item";
import { makePaymentReques } from "@/api/payment";

export default function Page() {
  const { items } = useCart();

  const validItems = items.filter(Boolean);
  const hasItems = validItems.length > 0;

  const totalPrice = validItems.reduce((total, item) => total + item.price, 0);

  const buyStripe = async () => {
    if (!hasItems) return;

    try {
      const res = await makePaymentReques.post("/api/orders", {
        data: {
          products: validItems.map((item) => ({
            id: item.id,
          })),
        },
      });

      window.location.href = res.data.stripeSession.url;
    } catch (error) {
      console.error("Stripe error:", error);
    }
  };

  return (
    <div className="max-w-6xl px-4 py-16 mx-auto">
      <h1 className="mb-5 text-3xl font-bold text-sky-700">
        Carrito de compras
      </h1>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          {!hasItems && (
            <>
              <p className="text-muted-foreground">
                No hay productos en el carrito. Agrega productos al carrito para
                visualizarlos aqui.
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-max"
              >
                Explorar productos
              </Button>
            </>
          )}

          <ul>
            {validItems.map((item) => (
              <CartItem key={item.id} product={item} />
            ))}
          </ul>
        </div>

        {hasItems ? (
          /* Resumen pedido */
          <div className="max-w-xl">
            <div className="p-6 rounded-lg bg-slate-100">
              <p className="mb-3 text-lg font-semibold">Resumen de pedido</p>
              <Separator />

              <div className="flex justify-between my-4">
                <p>Total del pedido</p>
                <p>{formatPrice(totalPrice)}</p>
              </div>

              <Button className="w-full" onClick={buyStripe}>
                Comprar
              </Button>
            </div>
          </div>
        ) : (
          /* Imagen con carrito vacio */
          <div className="flex items-center justify-center">
            <img
              src="/success-v2.png"
              alt="Carrito vacío"
              className="w-60 opacity-90"
            />
          </div>
        )}
      </div>
    </div>
  );
}
