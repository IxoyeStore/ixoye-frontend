"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Package, Users, Tag, Clock } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  processing: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  shipped: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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
    { label: "Pedidos", value: stats.orders, icon: ShoppingCart, href: "/admin/orders", iconBg: "bg-sky-50 dark:bg-sky-900/30", iconColor: "text-sky-600 dark:text-sky-400" },
    { label: "Productos", value: stats.products, icon: Package, href: "/admin/products", iconBg: "bg-emerald-50 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Usuarios", value: stats.users, icon: Users, href: "/admin/users", iconBg: "bg-violet-50 dark:bg-violet-900/30", iconColor: "text-violet-600 dark:text-violet-400" },
    { label: "Categorías", value: stats.categories, icon: Tag, href: "/admin/categories", iconBg: "bg-amber-50 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 md:px-10 space-y-6 md:space-y-8 w-full md:w-[85%] mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">Dashboard</h1>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statCards.map(({ label, value, icon: Icon, href, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-lg transition-all flex flex-col"
          >
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
              <Icon className={iconColor} size={20} />
            </div>
            <div className="mt-auto pt-6">
              <p className={`text-3xl font-black tracking-tighter text-slate-900 dark:text-white ${loading ? "opacity-0" : ""}`}>
                {value}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Pedidos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">
                <th className="text-left px-6 py-4">Folio</th>
                <th className="text-left px-6 py-4">Cliente</th>
                <th className="text-left px-6 py-4">Estado</th>
                <th className="text-right px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-5">
                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : recentOrders.map((order: any) => {
                    const s = order.orderStatus || "pending";
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-5 font-mono font-black text-slate-900 dark:text-white">
                          <Link href={`/admin/orders/${order.documentId || order.id}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-6 py-5 text-slate-600 dark:text-slate-400">{order.user?.username || order.user?.email || "—"}</td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${STATUS_COLORS[s] || "bg-slate-100 text-slate-600"}`}>
                            {STATUS_LABELS[s] || s}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-slate-900 dark:text-white">{formatPrice(order.total)}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-700">
          <Link href="/admin/orders" className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors">
            Ver todos los pedidos →
          </Link>
        </div>
      </div>
    </div>
  );
}
