/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";

interface Shipment {
  id: number;
  title: string;
  date: string;
  clientName: string;
  comment: string;
  rating: number;
  photos: { url: string }[];
}

const ShipmentSection = () => {
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: 1,
      title: "Envío a Colima",
      date: "2026-01-10",
      clientName: "Cliente Verificado",
      comment:
        "Llegó super rápido y el empaque muy seguro. ¡Excelente calidad!",
      rating: 5,
      photos: [],
    },
    {
      id: 2,
      title: "Envío a Vallarta",
      date: "2025-11-12",
      clientName: "Cliente Verificado",
      comment:
        "Todo excelente, me mantuvieron informado de mi guía en todo momento.",
      rating: 4.8,
      photos: [],
    },
    {
      id: 3,
      title: "Envío a Culiacán",
      date: "2025-11-6",
      clientName: "Cliente Verificado",
      comment: "Excelente calidad y buen precio.",
      rating: 4.6,
      photos: [],
    },
    {
      id: 4,
      title: "Envío a Tepic",
      date: "2025-11-05",
      clientName: "Cliente Verificado",
      comment: "Muy buena atención al cliente, resolvió todas mis dudas.",
      rating: 4.9,
      photos: [],
    },
  ]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/shipments?populate=*`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) setShipments(data.data);
      })
      .catch((err) => console.log("Usando placeholders de Ixoye Store"));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 sm:py-16 bg-white">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight px-2">
          Nuestros Clientes respaldan nuestro trabajo
        </h2>
        <p className="text-slate-500 mt-3 text-sm sm:text-base px-4">
          Transparencia en cada entrega, satisfacción y calidad en cada
          producto.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {shipments.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-xl shadow-sm border border-blue-50 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
          >
            {/* IMAGEN DE ENVIO */}
            <div className="aspect-[4/3] bg-blue-50/30 relative overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center border-b border-blue-100 bg-[#f8fafc]">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-[#0055a4] opacity-30 mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-[#0055a4] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">
                  Evidencia
                </span>
              </div>
            </div>

            <div className="p-3 sm:p-5 flex flex-col flex-grow">
              {/* CALIFICACION */}
              <div className="flex items-center mb-2 sm:mb-3 gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => {
                    const fillValue =
                      Math.min(Math.max(item.rating - i, 0), 1) * 100;
                    return (
                      <div key={i} className="relative w-3 h-3 sm:w-4 sm:h-4">
                        <svg
                          className="absolute w-full h-full text-gray-200 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div
                          className="absolute top-0 left-0 h-full overflow-hidden"
                          style={{ width: `${fillValue}%` }}
                        >
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <span className="text-[10px] font-bold text-slate-400 ml-0.5">
                  {item.rating.toFixed(1)}
                </span>
              </div>

              <p className="text-[#334155] text-[11px] sm:text-[13px] leading-snug sm:leading-relaxed italic mb-3 flex-grow line-clamp-4">
                {`"${item.comment}"`}
              </p>

              {/* FOOTER DE TARJETA */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 sm:gap-0">
                <div className="min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-1 font-bold text-[#003366] text-[10px] sm:text-xs">
                    <span className="truncate">{item.clientName}</span>
                    <BadgeCheck
                      size="1.1em"
                      className="text-[#0055a4] fill-blue-50 shrink-0"
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider font-medium truncate">
                    {item.title}
                  </p>
                </div>
                <p className="text-[8px] sm:text-[9px] font-bold text-blue-400 whitespace-nowrap">
                  {new Date(item.date).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShipmentSection;
