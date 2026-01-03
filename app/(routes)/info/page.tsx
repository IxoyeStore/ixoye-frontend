"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function InfoPage() {
  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      {/* Título */}
      <h1 className="text-3xl font-medium text-center">
        ¿Por qué comprar con nosotros?
      </h1>

      <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
        Queremos que compres con total confianza. Por eso cuidamos cada detalle
        desde el pago hasta la entrega de tu pedido.
      </p>

      <Separator className="my-10" />

      {/* Beneficios */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center text-center gap-4 py-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <h3 className="font-semibold">Pagos seguros</h3>
            <p className="text-sm text-muted-foreground">
              Todas las transacciones están protegidas mediante Stripe y
              encriptación de datos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center gap-4 py-6">
            <Truck className="w-10 h-10 text-primary" />
            <h3 className="font-semibold">Envíos confiables</h3>
            <p className="text-sm text-muted-foreground">
              Enviamos a todo el país con paqueterías confiables y seguimiento
              de tu pedido.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center gap-4 py-6">
            <CreditCard className="w-10 h-10 text-primary" />
            <h3 className="font-semibold">Múltiples métodos de pago</h3>
            <p className="text-sm text-muted-foreground">
              Aceptamos tarjetas de crédito y débito de forma rápida y segura.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center gap-4 py-6">
            <Headphones className="w-10 h-10 text-primary" />
            <h3 className="font-semibold">Atención al cliente</h3>
            <p className="text-sm text-muted-foreground">
              Si tienes dudas, estamos listos para ayudarte antes y después de
              tu compra.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold">
          Explora nuestra tienda y descubre productos seleccionados para ti.
        </h2>

        <div className="mt-6 flex justify-center gap-4">
          <Link href="/category" className={buttonVariants()}>
            Ir a la tienda
          </Link>

          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
