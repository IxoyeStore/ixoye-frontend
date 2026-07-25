"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useCart } from "@/hooks/use-cart";
import { Package, ShoppingBag, CheckCircle2 } from "lucide-react";

const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { removeAll } = useCart();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const openpayId = searchParams.get("id");

    if (openpayId) {
      setIsAuthorized(true);
      removeAll();
    } else {
      router.replace("/");
    }
  }, [searchParams, router, removeAll]);

  if (!isAuthorized) return null;

  return (
    <div className="max-w-5xl p-4 mx-auto sm:py-24 sm:px-24 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-12 items-center bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-sky-100/50 dark:shadow-none border border-slate-50 dark:border-slate-700">
        <div className="flex flex-col space-y-6 flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={24} className="animate-bounce" />
              <span className="font-black uppercase italic tracking-widest text-xs">
                Pago Confirmado
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-sky-950 dark:text-sky-300 uppercase italic tracking-tighter leading-none">
              ¡Gracias por <br />{" "}
              <span className="text-sky-600 dark:text-sky-400">tu compra!</span>
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed max-w-md">
              En breve, nuestro equipo se pondrá manos a la obra para preparar
              tu envío.
            </p>
            <p className="text-sky-700/60 dark:text-sky-400/70 font-medium italic text-sm border-l-4 border-sky-200 dark:border-sky-800 pl-4">
              Te enviaremos una notificación cuando tu pedido esté listo y en
              camino.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              onClick={() => router.push("/category")}
              className="px-10 py-8 rounded-2xl bg-sky-900 hover:bg-sky-950 text-white font-black uppercase text-[12px] tracking-[0.2em] shadow-xl shadow-sky-900/20 transition-all hover:scale-105"
            >
              <ShoppingBag className="mr-2 w-5 h-5" /> Volver a la tienda
            </Button>

            <Button
              onClick={() => router.push("/profile?tab=orders")}
              variant="outline"
              className="px-10 py-8 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-sky-950 dark:text-sky-300 font-black uppercase text-[12px] tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-sm"
            >
              <Package className="mr-2 w-5 h-5" /> Ver mis pedidos
            </Button>
          </div>
        </div>

        <div className="hidden md:flex justify-center md:min-w-[400px]">
          <Image src="/success-v2.png" alt="Success" width={300} height={600} />
        </div>
      </div>
    </div>
  );
};

export default function PageSuccess() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
