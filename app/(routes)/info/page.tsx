"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  PackageCheck,
  LockKeyhole,
  HandCoins,
  MessageCircleMore,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function InfoPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const beneficios = [
    {
      icon: LockKeyhole,
      title: "Pagos seguros",
      desc: "Todas las transacciones están protegidas mediante Openpay y encriptación de datos.",
    },
    {
      icon: PackageCheck,
      title: "Envíos confiables",
      desc: "Enviamos a todo el estado con paqueterías confiables y seguimiento de tu pedido.",
    },
    {
      icon: HandCoins,
      title: "Múltiples métodos de pago",
      desc: "Aceptamos tarjetas de crédito y débito de forma rápida y segura.",
    },
    {
      icon: MessageCircleMore,
      title: "Atención al cliente",
      desc: "Si tienes dudas, estamos listos para ayudarte antes y después de tu compra en nuestro horario de atención.",
    },
  ];

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24 overflow-hidden">
      <div
        className={`transition-all duration-1000 ease-out transform ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <h1 className="text-3xl font-medium text-center text-sky-900">
          ¿Por qué comprar con nosotros?
        </h1>
        <p className="mt-4 text-center text-sky-700 max-w-2xl mx-auto">
          Queremos que compres con total confianza. Por eso cuidamos cada
          detalle desde el pago hasta la entrega de tu pedido.
        </p>
      </div>

      <div
        className={`transition-all duration-1000 delay-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <Separator className="my-10 bg-sky-100" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {beneficios.map((item, index) => (
          <div
            key={index}
            className={`transition-all duration-700 ease-out transform`}
            style={{ transitionDelay: `${500 + index * 150}ms` }}
          >
            <Card
              className={`border-sky-100 bg-white shadow-sm shadow-sky-50 h-full hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <CardContent className="flex flex-col items-center text-center gap-4 py-6">
                <div className="p-3 bg-sky-700 rounded-full">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-sky-900">{item.title}</h3>
                <p className="text-sm text-sky-600">{item.desc}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div
        className={`mt-16 text-center transition-all duration-1000 transform ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "1300ms" }}
      >
        <h2 className="text-2xl font-semibold text-sky-900">
          Explora nuestra tienda y descubre productos seleccionados para ti.
        </h2>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/category"
            className={buttonVariants({
              className: "bg-sky-700 hover:bg-sky-800 text-white",
            })}
          >
            Ir a la tienda
          </Link>

          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              className: "border-sky-200 text-sky-700 hover:bg-sky-50",
            })}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
