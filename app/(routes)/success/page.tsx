"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/context/auth-context";
import { Package, ShoppingBag, CheckCircle2, Loader2, Clock } from "lucide-react";

type Status = "checking" | "paid" | "pending" | "invalid";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 12; // ~36s cubriendo el tiempo normal en que llega el webhook

const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { removeAll } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>("checking");
  const pollsRef = useRef(0);
  const removedCartRef = useRef(false);

  const orderId = searchParams.get("order");

  useEffect(() => {
    if (!orderId) {
      router.replace("/");
      return;
    }
    if (authLoading) return; // esperando a que cargue la sesion

    if (!user?.jwt) {
      // Sesion no disponible (pudo expirar entre el checkout y el regreso):
      // no podemos verificar el pago desde aqui, pero tampoco afirmamos
      // exito sin confirmarlo.
      setStatus("pending");
      return;
    }

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/status/${orderId}`,
          { headers: { Authorization: `Bearer ${user.jwt}` } },
        );

        if (!res.ok) {
          if (!cancelled) setStatus("invalid");
          return;
        }

        const { data } = await res.json();

        if (cancelled) return;

        if (data?.orderStatus === "paid") {
          setStatus("paid");
          if (!removedCartRef.current) {
            removedCartRef.current = true;
            removeAll();
          }
          return;
        }

        pollsRef.current += 1;
        if (pollsRef.current >= MAX_POLLS) {
          setStatus("pending");
          return;
        }

        setTimeout(checkStatus, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus("invalid");
      }
    };

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, [orderId, user?.jwt, authLoading, router, removeAll]);

  if (status === "invalid") {
    router.replace("/");
    return null;
  }

  if (status === "checking") {
    return (
      <div className="max-w-2xl p-4 mx-auto py-24 sm:py-32 text-center animate-in fade-in duration-500">
        <Loader2 size={40} className="mx-auto text-sky-500 animate-spin mb-6" />
        <p className="font-black uppercase tracking-widest text-sm text-sky-950 dark:text-sky-300">
          Confirmando tu pago...
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 font-medium">
          Esto puede tardar unos segundos, no cierres esta página.
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="max-w-2xl p-4 mx-auto py-24 sm:py-32 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-6">
          <Clock size={28} className="text-amber-500 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-sky-950 dark:text-sky-300 mb-3">
          Tu pago sigue en proceso
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-8">
          Aún no recibimos la confirmación. Si pagaste por transferencia o en
          banco, puede tardar más en confirmarse — te avisaremos por correo en
          cuanto se acredite. Si algo salió mal, tu pedido no se procesará.
        </p>
        <Button
          onClick={() => router.push("/profile?tab=orders")}
          className="px-8 py-6 rounded-2xl bg-sky-900 hover:bg-sky-950 text-white font-black uppercase text-[11px] tracking-[0.2em]"
        >
          <Package className="mr-2 w-4 h-4" /> Ver estado de mis pedidos
        </Button>
      </div>
    );
  }

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
