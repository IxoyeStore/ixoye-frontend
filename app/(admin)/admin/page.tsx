"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Package, Users, Tag, Clock } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En Preparación",
  shipped: "En Camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, users: 0, categories: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, productsRes, usersRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/orders?page=1"),
          fetch("/api/admin/products?page=1"),
          fetch("/api/admin/users?page=1"),
          fetch("/api/admin/categories?page=1"),
        ]);
        const [orders, products, users, categories] = await Promise.all([
          ordersRes.json(),
          productsRes.json(),
          usersRes.json(),
          categoriesRes.json(),
        ]);
        setStats({
          orders: orders.meta?.pagination?.total || 0,
          products: products.meta?.pagination?.total || 0,
          users: users.meta?.total || 0,
          categories: categories.meta?.pagination?.total || 0,
        });
        setRecentOrders((orders.data || []).slice(0, 8));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: "Pedidos", value: stats.orders, icon: ShoppingCart, href: "/admin/orders", iconBg: "bg-sky-50", iconColor: "text-sky-600" },
    { label: "Productos", value: stats.products, icon: Package, href: "/admin/products", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Usuarios", value: stats.users, icon: Users, href: "/admin/users", iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Categorías", value: stats.categories, icon: Tag, href: "/admin/categories", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Dashboard</h1>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, href, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
              <Icon className={iconColor} size={20} />
            </div>
            <p className={`text-3xl font-black tracking-tighter text-slate-900 ${loading ? "opacity-0" : ""}`}>
              {value}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Pedidos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-black tracking-widest">
                <th className="text-left px-6 py-3">Folio</th>
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Estado</th>
                <th className="text-right px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : recentOrders.map((order: any) => {
                    const s = order.orderStatus || "pending";
                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-black text-slate-900">
                          <Link href={`/admin/orders/${order.documentId || order.id}`} className="hover:text-sky-600 transition-colors">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{order.user?.username || order.user?.email || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_COLORS[s] || "bg-slate-100 text-slate-600"}`}>
                            {STATUS_LABELS[s] || s}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{formatPrice(order.total)}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-800 transition-colors">
            Ver todos los pedidos →
          </Link>
        </div>
      </div>
    </div>
  );
}
