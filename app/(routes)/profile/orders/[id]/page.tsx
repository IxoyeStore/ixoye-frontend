/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/formatPrice";
import { ChevronLeft, Printer } from "lucide-react";
import Link from "next/link";

const statusMap: Record<string, { label: string; class: string }> = {
  pending: {
    label: "Pendiente",
    class: "border-amber-200 text-amber-700 bg-amber-50",
  },
  processing: {
    label: "En Preparación",
    class: "border-sky-200 text-sky-700 bg-sky-50",
  },
  completed: {
    label: "Entregado",
    class: "border-emerald-200 text-emerald-700 bg-emerald-50",
  },
  shipped: {
    label: "En Camino",
    class: "border-violet-200 text-violet-700 bg-violet-50",
  },
  cancelled: {
    label: "Cancelado",
    class: "border-red-200 text-red-700 bg-red-50",
  },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !user.jwt || !id) return;
      setLoading(true);
      try {
        let url = `https://ixoye-backend-production.up.railway.app/api/orders/${id}?`;
        let response = await fetch(url, {
          headers: { Authorization: `Bearer ${user.jwt}` },
        });

        if (response.status === 404) {
          url = `https://ixoye-backend-production.up.railway.app/api/orders?filters[id][$eq]=${id}`;
          response = await fetch(url, {
            headers: { Authorization: `Bearer ${user.jwt}` },
          });
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            setOrder(result.data[0]);
            return;
          }
        }
        const { data } = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-[10px]">
        Generando vista de ticket...
      </div>
    );
  if (!order)
    return (
      <div className="p-20 text-center">
        <p className="font-bold text-red-500 uppercase text-[10px]">
          Error: Orden no localizada
        </p>
      </div>
    );

  const data = order.attributes || order;
  const orderId = order.id;
  const qrUrl = typeof window !== "undefined" ? window.location.href : "";
  const currentStatus = statusMap[data.orderStatus?.toLowerCase()] || {
    label: "Procesado",
    class: "border-slate-200 text-slate-600 bg-slate-50",
  };
  const date = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--/--/--";

  return (
    <>
      <style jsx global>{`
        @media print {
          header,
          footer,
          nav,
          .print-hidden {
            display: none !important;
          }
          body {
            background: white !important;
            margin: 0;
            color: black;
          }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="p-4 md:p-12 max-w-4xl mx-auto space-y-8 print-container">
        {/* Acciones Web */}
        <div className="flex justify-between items-center print-hidden border-b border-slate-100 pb-4">
          <Link
            href="/profile?tab=orders"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={14} />
            Regresar
          </Link>
          <button
            onClick={handlePrint}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2"
          >
            <Printer size={14} /> Imprimir Comprobante
          </button>
        </div>

        {/* Encabezado */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Logo Ixoye"
              className="w-16 h-16 object-contain print:grayscale "
            />
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                <span className="text-[#0055a4] print:grayscale">
                  Refacciones Diésel <br className="md:hidden" /> y Agrícola
                  Ixoye
                </span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Nota de Remisión
              </p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div
              className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase border ${currentStatus.class} print:grayscale`}
            >
              {currentStatus.label}
            </div>
            <p className="text-[14px] font-mono font-bold text-slate-950 block mt-2">
              FOLIO: #ORD-{orderId}
            </p>
          </div>
        </div>

        {/* Datos de la Transacción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px]">
          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-slate-400 border-b pb-1 text-[9px]">
              Detalles de Venta
            </h3>
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-slate-500 uppercase font-medium">
                Fecha de Emisión:
              </span>
              <span className="text-slate-950 font-bold text-right md:text-left">
                {date}
              </span>
              <span className="text-slate-500 uppercase font-medium">
                Hora de Registro:
              </span>
              <span className="text-slate-950 font-bold text-right md:text-left">
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleTimeString()
                  : "--:--"}
              </span>
              <span className="text-slate-500 uppercase font-medium">
                Método de Pago:
              </span>
              <span className="text-slate-950 font-bold text-right md:text-left italic">
                <span className="capitalize">
                  {data.cardBrand || "Tarjeta"}
                </span>{" "}
                termina en {data.cardLast4 || "4242"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-slate-400 border-b pb-1 text-[9px]">
              Validación Digital
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={`https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(
                  qrUrl,
                )}&chs=120x120&chld=L|0`}
                className="w-16 h-16 grayscale"
                alt="QR"
              />
              <div className="space-y-1">
                <p className="text-slate-400 text-[8px] leading-tight uppercase font-bold tracking-tighter">
                  Referencia de rastreo:
                </p>
                <p className="font-mono text-slate-600 text-[9px] break-all">
                  {data.stripeId || "ST-ONLINE-TRANS"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div className="space-y-4">
          <h3 className="font-bold uppercase tracking-widest text-slate-400 text-[9px]">
            Descripción de Productos
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase font-bold italic">
                  <th className="p-4 text-left">Concepto</th>
                  <th className="p-4 text-center w-24">Cant.</th>
                  <th className="p-4 text-right w-32">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.products?.map((item: any, idx: number) => (
                  <tr key={idx} className="text-slate-900">
                    <td className="p-4 font-bold uppercase tracking-tight">
                      {item.productName || item.name}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {item.quantity || 1}f
                    </td>
                    <td className="p-4 text-right font-bold">
                      {formatPrice(item.price * (item.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="flex justify-end print:grayscale">
          <div className="w-full md:w-64 space-y-2 border-t-2 border-slate-900 pt-4">
            <div className="flex justify-between text-[11px] font-medium text-slate-500 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>{formatPrice(data.total)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-500 uppercase tracking-widest">
              <span>Envío </span>
              <span className="text-emerald-600 font-bold">Sin Costo</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[12px] font-black uppercase text-slate-950 tracking-tighter">
                Total
              </span>
              <span className="text-2xl font-black text-slate-950 tracking-tighter">
                {formatPrice(data.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer del Ticket */}
        <div className="pt-12 border-t border-slate-100 space-y-6 text-center">
          <div className="bg-slate-50 p-4 rounded text-[9px] text-slate-400 uppercase font-medium leading-relaxed tracking-widest print:bg-white print:border print:border-slate-100">
            <p>Este documento no tiene validez como comprobante fiscal.</p>
            <p className="mt-2">
              Gracias por comprar en{" "}
              <span className="text-slate-900 font-black">
                refaccionesixoye.mx
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
