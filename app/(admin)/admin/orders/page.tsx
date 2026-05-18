"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "processing", label: "En Preparación" },
  { value: "shipped", label: "En Camino" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.data || []);
    setTotal(data.meta?.pagination?.total || 0);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Pedidos</h1>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{total} pedidos en total</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={14} className="text-slate-400 shrink-0" />
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              statusFilter === value
                ? "bg-sky-600 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-black tracking-widest bg-slate-200">
                <th className="text-left px-6 py-4">Folio</th>
                <th className="text-left px-6 py-4">Cliente</th>
                <th className="text-left px-6 py-4">Fecha</th>
                <th className="text-left px-6 py-4">Estado</th>
                <th className="text-right px-6 py-4">Total</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const s = order.orderStatus || "pending";
                  const date = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-slate-900">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900">{order.user?.username || "—"}</div>
                        <div className="text-slate-400">{order.user?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_COLORS[s] || "bg-slate-100 text-slate-600"}`}>
                          {STATUS_OPTIONS.find((o) => o.value === s)?.label || s}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.documentId || order.id}`}
                          className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-800 transition-colors whitespace-nowrap"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-200 disabled:opacity-40 hover:border-sky-300 transition-all"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-200 disabled:opacity-40 hover:border-sky-300 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
