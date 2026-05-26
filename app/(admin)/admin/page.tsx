"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Package, Users, Tag, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  processing: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  shipped:    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  delivered:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "Pendiente",
  paid:       "Pagado",
  processing: "En Preparación",
  shipped:    "En Camino",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
};

function stockColor(stock: number) {
  if (stock === 0) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (stock <= 3)  return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, users: 0, categories: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock]         = useState<any[]>([]);
  const [topProducts, setTopProducts]   = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, productsRes, usersRes, categoriesRes, lowStockRes, topRes] =
          await Promise.all([
            fetch("/api/admin/orders?page=1"),
            fetch("/api/admin/products?page=1"),
            fetch("/api/admin/users?page=1"),
            fetch("/api/admin/categories?page=1"),
            fetch("/api/admin/products?sort=stock:asc&pageSize=6"),
            fetch("/api/admin/products?sort=views:desc&pageSize=5"),
          ]);

        const [orders, products, users, categories, lowStockData, topData] =
          await Promise.all([
            ordersRes.json(),
            productsRes.json(),
            usersRes.json(),
            categoriesRes.json(),
            lowStockRes.json(),
            topRes.json(),
          ]);

        setStats({
          orders:     orders.meta?.pagination?.total     || 0,
          products:   products.meta?.pagination?.total   || 0,
          users:      users.meta?.total                  || 0,
          categories: categories.meta?.pagination?.total || 0,
        });

        setRecentOrders((orders.data || []).slice(0, 8));
        setLowStock((lowStockData.data || []).filter((p: any) => (p.stock ?? 0) <= 5));
        setTopProducts((topData.data || []).filter((p: any) => (p.views ?? 0) > 0));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: "Pedidos",    value: stats.orders,     icon: ShoppingCart, href: "/admin/orders",     bg: "bg-sky-50 dark:bg-sky-900/30",     color: "text-sky-600 dark:text-sky-400"    },
    { label: "Productos",  value: stats.products,   icon: Package,      href: "/admin/products",   bg: "bg-emerald-50 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Usuarios",   value: stats.users,      icon: Users,        href: "/admin/users",      bg: "bg-violet-50 dark:bg-violet-900/30",   color: "text-violet-600 dark:text-violet-400"  },
    { label: "Categorías", value: stats.categories, icon: Tag,          href: "/admin/categories", bg: "bg-amber-50 dark:bg-amber-900/30",     color: "text-amber-600 dark:text-amber-400"    },
  ];

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 md:px-10 space-y-6 md:space-y-8 w-full md:w-[85%] mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">
          Dashboard
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest">
          Resumen general del sistema
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {statCards.map(({ label, value, icon: Icon, href, bg, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-lg transition-all flex flex-col"
          >
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={color} size={18} />
            </div>
            <div className="mt-auto pt-5">
              <p className={`text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}>
                {value}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                {label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-slate-400 dark:text-slate-500" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Pedidos Recientes
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-700">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 space-y-2">
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-24" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-36" />
                  </div>
                ))
              : recentOrders.map((order: any) => {
                  const s = order.orderStatus || "pending";
                  return (
                    <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/orders/${order.documentId || order.id}`}
                          className="font-mono font-black text-sm text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                          #{order.id}
                        </Link>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {order.user?.username || order.user?.email || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[s] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
                          {STATUS_LABELS[s] || s}
                        </span>
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest text-[10px]">
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
                          <td className="px-6 py-4 font-mono font-black text-slate-900 dark:text-white">
                            <Link
                              href={`/admin/orders/${order.documentId || order.id}`}
                              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                            >
                              #{order.id}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {order.user?.username || order.user?.email || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[s] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
                              {STATUS_LABELS[s] || s}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                            {formatPrice(order.total)}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="px-5 py-4 md:py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500 dark:text-amber-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              Stock Bajo
            </h2>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 space-y-1.5">
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-32" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-16" />
                  </div>
                ))
              : lowStock.length === 0
              ? (
                <div className="px-5 py-8 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Sin alertas de stock
                </div>
              )
              : lowStock.map((p: any) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/products/${p.documentId}`}
                      className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate"
                    >
                      {p.productName}
                    </Link>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${stockColor(p.stock ?? 0)}`}>
                      {p.stock ?? 0} uds
                    </span>
                  </div>
                ))}
          </div>
          {!loading && lowStock.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
              <Link
                href="/admin/products?sort=stock:asc"
                className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
              >
                Ver todos con stock bajo →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top Products by Views */}
      {!loading && topProducts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Productos Más Vistos
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-700">
            {topProducts.map((p: any, i: number) => (
              <div key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                <span className="text-xs font-black text-slate-300 dark:text-slate-600 w-4 shrink-0">{i + 1}</span>
                <Link
                  href={`/admin/products/${p.documentId}`}
                  className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate flex-1"
                >
                  {p.productName}
                </Link>
                <span className="shrink-0 text-[10px] font-black text-sky-600 dark:text-sky-400">
                  {p.views ?? 0} <span className="text-slate-300 dark:text-slate-600">vistas</span>
                </span>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest text-[10px]">
                  <th className="text-left px-6 py-3 w-8">#</th>
                  <th className="text-left px-6 py-3">Producto</th>
                  <th className="text-right px-6 py-3">Vistas</th>
                  <th className="text-right px-6 py-3">Carrito</th>
                  <th className="text-right px-6 py-3">Compras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {topProducts.map((p: any, i: number) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-300 dark:text-slate-600 font-black text-xs">{i + 1}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/products/${p.documentId}`}
                        className="font-bold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                      >
                        {p.productName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sky-600 dark:text-sky-400">{p.views ?? 0}</td>
                    <td className="px-6 py-4 text-right font-black text-violet-600 dark:text-violet-400">{p.cartAdds ?? 0}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">{p.purchases ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
