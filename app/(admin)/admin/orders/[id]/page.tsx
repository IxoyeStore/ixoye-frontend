"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";

const STATUS_OPTIONS = [
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-[11px]">
      <span className="text-slate-400 uppercase font-bold whitespace-nowrap">{label}</span>
      <span className={`text-slate-900 font-black text-right ${mono ? "font-mono text-[10px] break-all" : ""}`}>{value}</span>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      const o = json.data || json;
      setOrder(o);
      setStatus(o?.orderStatus || "pending");
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: status }),
    });
    if (res.ok) {
      toast.success("Estado actualizado");
    } else {
      toast.error("Error al actualizar el estado");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="p-8 animate-pulse text-slate-400 text-[10px] font-black uppercase tracking-widest">Cargando...</div>
  );

  if (!order) return (
    <div className="p-8 text-red-500 text-[10px] font-black uppercase tracking-widest">Pedido no encontrado</div>
  );

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleString("es-MX", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const currentStatus = STATUS_OPTIONS.find((o) => o.value === status);

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Pedidos
        </Link>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Pedido #{order.id}</h1>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}>
          {currentStatus?.label || status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Información del Pedido</h2>
          <div className="space-y-3">
            <Row label="Fecha" value={date} />
            <Row label="Método de Pago" value={order.cardBrand ? `${order.cardBrand} ···· ${order.cardLast4}` : "—"} />
            <Row label="Referencia" value={order.stripeId || "—"} mono />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</h2>
          <div className="space-y-3">
            <Row label="Usuario" value={order.user?.username || "—"} />
            <Row label="Correo" value={order.user?.email || "—"} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cambiar Estado</h2>
          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black uppercase tracking-widest bg-slate-50 focus:outline-none focus:border-sky-400"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 transition-all"
            >
              <Save size={14} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {order.address && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dirección de Entrega</h2>
            <div className="space-y-1 text-[11px]">
              <p className="font-black text-slate-900">{order.address.street}</p>
              <p className="text-slate-600">{order.address.neighborhood}, {order.address.city}</p>
              <p className="text-slate-600">{order.address.state}, CP {order.address.postalCode}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Productos</h2>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 uppercase font-black tracking-widest bg-slate-200">
              <th className="text-left px-6 py-3">Producto</th>
              <th className="text-center px-6 py-3">Cant.</th>
              <th className="text-right px-6 py-3">Precio</th>
              <th className="text-right px-6 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(order.products || []).map((p: any, i: number) => (
              <tr key={i}>
                <td className="px-6 py-4 font-black uppercase text-slate-900">{p.productName || p.name}</td>
                <td className="px-6 py-4 text-center font-bold text-slate-600">{p.quantity || 1}</td>
                <td className="px-6 py-4 text-right text-slate-600">{formatPrice(p.price)}</td>
                <td className="px-6 py-4 text-right font-black text-slate-900">{formatPrice(p.price * (p.quantity || 1))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-900">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right text-[12px] font-black uppercase tracking-widest text-slate-900">Total</td>
              <td className="px-6 py-4 text-right text-xl font-black text-slate-900">{formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
