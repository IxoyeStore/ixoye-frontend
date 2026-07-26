"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, User, MapPin, Truck } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import { ProductImage } from "@/components/product-image";
import { CopyableCode } from "@/components/copyable-code";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "processing", label: "En Preparación" },
  { value: "shipped", label: "En Camino" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  processing: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  shipped: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-400 dark:text-slate-500 uppercase font-bold whitespace-nowrap text-xs">{label}</span>
      <span className={`text-slate-900 dark:text-white font-black text-right ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</span>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [productLookup, setProductLookup] = useState<Record<string, { code?: string; image?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        const json = await res.json();
        if (!res.ok) { setOrder(null); setLoading(false); return; }
        const o = json.data ?? null;
        setOrder(o);
        setStatus(o?.orderStatus ?? "pending");

        if (o?.user?.id) {
          const addrRes = await fetch(`/api/admin/user-address?userId=${o.user.id}`);
          const addrJson = await addrRes.json();
          const raw = addrJson._raw?.data?.[0] ?? null;
          setAddress(raw ? (raw.attributes ?? raw) : null);
        }

        // Pedidos anteriores a que se guardara code/image en el snapshot:
        // buscamos esos datos por documentId para que igual muestren miniatura.
        const missing = (o?.products || [])
          .filter((p: any) => p.documentId && (!p.code || !p.image))
          .map((p: any) => p.documentId);
        if (missing.length > 0) {
          const prodRes = await fetch(`/api/admin/products?documentIds=${missing.join(",")}`);
          const prodJson = await prodRes.json();
          const lookup: Record<string, { code?: string; image?: string }> = {};
          for (const item of prodJson.data || []) {
            lookup[item.documentId] = { code: item.code, image: Array.isArray(item.images) ? item.images[0] : undefined };
          }
          setProductLookup(lookup);
        }
      } catch (e) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full md:w-[85%] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Pedidos
        </Link>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">Pedido #{order.id}</h1>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}>
          {currentStatus?.label || status}
        </span>
        <div className="ml-auto hidden sm:flex flex-col items-end gap-0.5">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">{date}</p>
          {order.paymentMethod && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {order.paymentMethod}{order.cardLast4 ? ` ···· ${order.cardLast4}` : ""}
            </p>
          )}
          {order.stripeId && (
            <p className="text-[10px] font-mono text-slate-300 dark:text-slate-600">{order.stripeId}</p>
          )}
        </div>
      </div>

      {/* Status action bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">Estado del pedido</span>
        <div className="flex flex-1 gap-3 min-w-0">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-sky-400"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 transition-all shrink-0"
          >
            <Save size={14} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
              <User size={13} className="text-sky-500" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Cliente</h2>
          </div>
          <div className="space-y-3">
            <Row label="Nombre" value={order.user?.username || "—"} />
            <Row label="Correo" value={order.user?.email || "—"} />
            {order.phone && <Row label="Teléfono" value={order.phone} />}
          </div>
        </div>

        {/* Shipping + address */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <Truck size={13} className="text-violet-500" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Envío</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{order.shippingLabel || "Envío Estándar"}</span>
            <span className={`text-sm font-black ${order.shippingPrice === 0 ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
              {order.shippingPrice === 0 ? "¡GRATIS!" : order.shippingPrice != null ? formatPrice(order.shippingPrice) : "—"}
            </span>
          </div>
          {address ? (
            <div className="flex gap-2">
              <MapPin size={14} className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{address.street}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {[address.neighborhood, address.city, address.state].filter(Boolean).join(", ")}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">CP {address.postalCode || order.postalCode}</p>
                {address.references && <p className="text-xs text-slate-400 dark:text-slate-500 italic">{address.references}</p>}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <MapPin size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">CP {order.postalCode || "—"}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Productos</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase font-black tracking-widest bg-slate-200 dark:bg-slate-700/50">
              <th className="text-left px-6 py-3">Producto</th>
              <th className="text-left px-6 py-3">Código</th>
              <th className="text-center px-6 py-3">Cant.</th>
              <th className="text-right px-6 py-3">Precio</th>
              <th className="text-right px-6 py-3">IVA</th>
              <th className="text-right px-6 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {(order.products || []).map((p: any, i: number) => {
              const fallback = productLookup[p.documentId] || {};
              const code = p.code || fallback.code;
              const image = p.image || fallback.image;
              const lineTotal = p.price * (p.quantity || 1);
              const lineIva = lineTotal - lineTotal / 1.16;
              return (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 shrink-0">
                        <ProductImage url={image} alt={p.productName || p.name} className="w-full h-full" />
                      </div>
                      <p className="font-black uppercase text-slate-900 dark:text-white truncate">{p.productName || p.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {code ? <CopyableCode code={code} /> : "—"}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{p.quantity || 1}</td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">{formatPrice(lineIva)}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">{formatPrice(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {order.subtotal != null && (
              <tr>
                <td colSpan={5} className="px-6 py-2 text-right text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Subtotal</td>
                <td className="px-6 py-2 text-right text-sm font-bold text-slate-500 dark:text-slate-400">{formatPrice(order.subtotal)}</td>
              </tr>
            )}
            {order.iva != null && (
              <tr>
                <td colSpan={5} className="px-6 py-2 text-right text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">IVA</td>
                <td className="px-6 py-2 text-right text-sm font-bold text-slate-500 dark:text-slate-400">{formatPrice(order.iva)}</td>
              </tr>
            )}
            <tr className="border-t-2 border-slate-900 dark:border-slate-600">
              <td colSpan={5} className="px-6 py-4 text-right text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Total</td>
              <td className="px-6 py-4 text-right text-2xl font-black text-slate-900 dark:text-white">{formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    </div>
  );
}
