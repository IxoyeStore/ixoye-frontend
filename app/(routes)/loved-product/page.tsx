/* eslint-disable @next/next/no-img-element */
"use client";

import { useLovedProducts } from "@/hooks/use-loved-products";
import LovedItemProduct from "./components/loved-item-product";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  const { lovedItems } = useLovedProducts();

  return (
    <div className="max-w-6xl py-12 mx-auto px-6 min-h-[70vh] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b border-slate-100 pb-6 mb-10">
        <h1 className="text-4xl font-black text-sky-950 uppercase italic tracking-tighter">
          Productos guardados
        </h1>
        <p className="text-sky-600 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
          Tus refacciones favoritas
        </p>
      </div>

      <div className="mt-6">
        {lovedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 px-4">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-slate-100/50">
              <Heart size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest mb-2">
              Lista vacía
            </p>
            <p className="text-slate-400 text-sm italic mb-8 max-w-xs mx-auto">
              Aún no has guardado ningún producto. Explora nuestro catálogo para
              encontrar lo que necesitas.
            </p>

            <Link href="/category">
              <Button className="rounded-full bg-sky-800 hover:bg-sky-950 text-white font-black uppercase text-[10px] tracking-[0.2em] px-10 py-7 shadow-xl shadow-sky-900/20 transition-all hover:scale-105 active:scale-95 flex gap-2">
                Ir a la tienda
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lovedItems.map((item) => (
              <LovedItemProduct key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
