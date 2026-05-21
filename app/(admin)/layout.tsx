"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Tag,
  LogOut,
  ChevronRight,
  FileSpreadsheet,
  Menu,
  X,
  Bell,
  Home,
} from "lucide-react";
import { useOrderNotifications } from "@/hooks/use-order-notifications";
import { AdminThemeToggle } from "@/components/admin-theme-toggle";

const THEME_KEY = "admin-theme";

const DOTS = ["·", "··", "···"];

function AdminLoadingScreen() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % DOTS.length), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-slate-950">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
        Verificando acceso
      </p>
      <p className="text-2xl font-black tracking-[0.5em] text-sky-400 w-20 text-center tabular-nums">
        {DOTS[frame]}
      </p>
    </div>
  );
}

const navItems = [
  { href: "/admin",               label: "Dashboard",     icon: LayoutDashboard, exact: true },
  { href: "/admin/orders",        label: "Pedidos",        icon: ShoppingCart,    exact: false },
  { href: "/admin/products/bulk", label: "Editor Masivo",  icon: FileSpreadsheet, exact: false },
  { href: "/admin/products",      label: "Productos",      icon: Package,         exact: false },
  { href: "/admin/users",         label: "Usuarios",       icon: Users,           exact: false },
  { href: "/admin/categories",    label: "Categorías",     icon: Tag,             exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem(THEME_KEY) === "dark");
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  };
  const { newOrders, newCount, clearNotifications, removeOrder } = useOrderNotifications();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);
  useEffect(() => { setNotifOpen(false); }, [pathname]);

  useEffect(() => {
    if (!loading && (!user || user.role?.name !== "Admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <AdminLoadingScreen />;
  }

  if (!user || user.role?.name !== "Admin") return null;

  const activeHref = navItems
    .filter(({ href, exact }) =>
      exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const toggleNotif = () => {
    setSidebarOpen(false);
    setNotifOpen((o) => !o);
  };

  return (
    <div className={isDark ? "dark" : ""}>
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {notifOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      )}

      {/* Notification popover */}
      {notifOpen && (
        <div
          className="fixed z-50
            left-4 right-4 top-[57px]
            md:left-[252px] md:right-auto md:top-4 md:w-96"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow — desktop only */}
          <div className="hidden md:block absolute -left-[9px] top-6 w-4 h-4 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 rotate-45 shadow-[-2px_2px_3px_rgba(0,0,0,0.04)]" />

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/80 dark:shadow-slate-950/80 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-2">
                <Bell size={14} className={newCount > 0 ? "text-sky-500" : "text-slate-400"} />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                  {newCount > 0
                    ? `${newCount} nueva${newCount !== 1 ? "s" : ""} orden${newCount !== 1 ? "es" : ""}`
                    : "Notificaciones"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {newCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    Limpiar todo
                  </button>
                )}
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            {newOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Bell size={22} className="text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Sin nuevas órdenes
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {newOrders.map((order) => {
                  const time = order.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
                    : null;
                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.documentId || order.id}`}
                      onClick={() => { removeOrder(order.id); setNotifOpen(false); }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center shrink-0">
                        <ShoppingCart size={16} className="text-sky-600 dark:text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                          Tienes una nueva orden
                        </p>
                        <p className="text-slate-900 dark:text-white font-black text-sm leading-tight mt-0.5">
                          Pedido #{order.id}
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold truncate mt-0.5">
                          {order.user?.username || "Cliente"}{time ? ` · ${time}` : ""}
                        </p>
                      </div>
                      <ChevronRight size={15} className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 flex flex-col transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:w-60 md:shrink-0`}
      >
        {/* Brand header + toggle + bell */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Admin Panel</p>
            <h1 className="text-white font-black text-xl uppercase tracking-tighter italic">Ixoye</h1>
          </div>

          <div className="flex items-center gap-1">
            <AdminThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button
              onClick={toggleNotif}
              className={`relative p-2 rounded-xl transition-all ${
                notifOpen
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Bell size={17} />
              {newCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none">
                  {newCount > 9 ? "9+" : newCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === activeHref;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-slate-800 space-y-0.5">
          <div className="px-4 py-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Conectado como</p>
            <p className="text-white text-[11px] font-black truncate">{user.username}</p>
          </div>
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Home size={15} />
            Ir a la Tienda
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-950 hover:text-red-300 transition-all"
          >
            <LogOut size={15} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest italic">Ixoye Admin</span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ir a la Tienda"
            >
              <Home size={20} />
            </Link>
            <AdminThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button
              onClick={toggleNotif}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell size={20} />
              {newCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none">
                  {newCount > 9 ? "9+" : newCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
    </div>
  );
}
