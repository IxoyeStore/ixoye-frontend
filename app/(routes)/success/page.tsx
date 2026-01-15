"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";

const PageSuccess = () => {
  const router = useRouter();
  const { removeAll } = useCart();

  useEffect(() => {
    removeAll();
  }, [removeAll]);

  return (
    <div className="max-w-5xl p-4 mx-auto sm:py-16 sm:px-24">
      <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center">
        <div className="flex justify-center md:min-w-[400px]">
          <Image
            src="/success-v2.png"
            alt="Success"
            width={250}
            height={500}
            className="rounded-lg opacity-90"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-sky-900">
            ¡Gracias por tu compra!
          </h1>

          <p className="my-3 text-sky-700">
            En breve, nuestro equipo se pondrá manos a la obra para preparar tu
            envío.
          </p>

          <p className="my-3 text-sky-700">
            Te enviaremos una notificación cuando tu pedido esté listo y en
            camino.
          </p>

          <div className="flex justify-center sm:justify-start mt-6">
            <Button
              onClick={() => router.push("/")}
              className="px-8 py-6 text-lg bg-sky-700 hover:bg-sky-800 text-white transition-colors"
            >
              Volver a la tienda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSuccess;
