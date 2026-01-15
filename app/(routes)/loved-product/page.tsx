/* eslint-disable @next/next/no-img-element */
"use client";

import { useLovedProducts } from "@/hooks/use-loved-products";
import LovedItemProduct from "./components/loved-item-product";

export default function Page() {
  const { lovedItems } = useLovedProducts();

  return (
    <div className="max-w-6xl py-12 mx-auto px-6 min-h-[60vh]">
      <h1 className="text-2xl md:text-3xl font-black text-[#001e36] mb-8">
        Productos guardados
      </h1>

      <div className="mt-6">
        {lovedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
            <p className="text-xl font-bold text-slate-400">
              No hay productos guardados
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Tus refacciones guardadas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lovedItems.map((item) => (
              <LovedItemProduct key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}