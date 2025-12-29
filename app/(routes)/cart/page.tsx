"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/formatPrice"
import CartItem from "./components/cart-item"
import { makePaymentReques } from "@/api/payment"

export default function Page() {
  const { items, removeAll } = useCart()

  const validItems = items.filter(Boolean)

  const totalPrice = validItems.reduce(
    (total, item) => total + item.price,
    0
  )

  const buyStripe = async () => {
    try {
      const res = await makePaymentReques.post("/api/orders", {
        data: {
          products: validItems.map((item) => ({
            id: item.id,
          })),
        },
      })
      window.location.href = res.data.stripeSession.url
      removeAll()
    } catch (error) {
      console.error("Stripe error:", error)
    }
  }

  return (
    <div className="max-w-6xl px-4 py-16 mx-auto">
      <h1 className="mb-5 text-3xl font-bold">Carrito de compras</h1>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          {validItems.length === 0 && <p>No hay productos en el carrito.</p>}
          <ul>
            {validItems.map((item) => (
              <CartItem key={item.id} product={item} />
            ))}
          </ul>
        </div>

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
      </div>
    </div>
  )
}
