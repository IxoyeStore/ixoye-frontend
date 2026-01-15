/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/formatPrice";
import CartItem from "./components/cart-item";
import { makePaymentReques } from "@/api/payment";
import { useAuth } from "@/context/auth-context";

export default function Page() {
  const { items } = useCart();
  const { user } = useAuth();

  const validItems = items.filter(Boolean);
  const hasItems = validItems.length > 0;

  const totalPrice = validItems.reduce((total, item) => {
    return total + item.price * (item.quantity || 1);
  }, 0);

  const buyStripe = async () => {
    if (!hasItems) return;

    if (!user?.users_permissions_user?.phone) {
      alert(
        "Por favor, completa tu información de perfil (teléfono) antes de comprar."
      );
      window.location.href = "/profile/edit";
      return;
    }

    try {
      const res = await makePaymentReques.post("/api/orders", {
        data: {
          products: validItems.map((item) => ({
            id: item.id,
            quantity: item.quantity || 1,
          })),
          userId: user.id,
          email: user.email,
          username: user.username,
          phone: user.users_permissions_user.phone || "",
          fullName: `${user.users_permissions_user.firstName} ${user.users_permissions_user.lastName}`,
        },
      });

      window.location.href = res.data.stripeSession.url;
    } catch (error) {
      console.error("Stripe error:", error);
    }
  };

  return (
    <div className="max-w-6xl px-4 py-16 mx-auto">
      <h1 className="mb-5 text-3xl font-bold text-sky-900">
        Carrito de compras
      </h1>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          {!hasItems && (
            <>
              <p className="text-sky-600/90 text-lg">
                No hay productos en el carrito. Agrega productos al carrito para
                visualizarlos aqui.
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/category")}
                className="w-max border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-700/90 text-lg"
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
          <div className="max-w-xl">
            <div className="p-6 rounded-lg bg-sky-50/50 border border-sky-100">
              <p className="mb-3 text-xl font-semibold text-sky-900">
                Resumen de pedido
              </p>
              <Separator className="bg-sky-100" />

              <div className="flex justify-between my-4">
                <p className="text-sky-800">Total del pedido</p>
                <p className="text-emerald-600">{formatPrice(totalPrice)}</p>
              </div>

              {!user ? (
                <Button
                  className="w-full bg-sky-700 hover:bg-sky-800 text-white"
                  onClick={() => {
                    window.location.href = `/login?callbackUrl=${encodeURIComponent(
                      window.location.pathname
                    )}`;
                  }}
                >
                  Comprar
                </Button>
              ) : (
                <Button
                  className="w-full bg-sky-700 hover:bg-sky-800/90 text-white"
                  onClick={buyStripe}
                >
                  Comprar
                </Button>
              )}
            </div>
          </div>
        ) : (
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
