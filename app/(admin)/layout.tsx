"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
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
} from "lucide-react";

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

  useEffect(() => {
    if (!loading && (!user || user.role?.name !== "Admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white text-[10px] uppercase tracking-widest font-black animate-pulse">
        Verificando acceso...
      </div>
    );
  }

  if (!user || user.role?.name !== "Admin") return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-60 bg-slate-950 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Panel Admin</p>
          <h1 className="text-white font-black text-xl uppercase tracking-tighter italic">Ixoye</h1>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* Find the most-specific matching nav item so /products/bulk doesn't also highlight /products */}
          {(() => {
            const activeHref = navItems
              .filter(({ href, exact }) => exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"))
              .sort((a, b) => b.href.length - a.href.length)[0]?.href;
            return navItems.map(({ href, label, icon: Icon }) => {
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
          });
          })()}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="px-4 py-2 mb-1">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Conectado como</p>
            <p className="text-white text-[11px] font-black truncate">{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-950 hover:text-red-300 transition-all"
          >
            <LogOut size={15} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
