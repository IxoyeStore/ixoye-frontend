/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Store,
  Menu,
  X,
  BaggageClaim,
  Heart,
  UserRound,
  Search,
  Package,
  ShieldCheck,
  ChevronDown,
  Headset,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import SupportMenu from "./support-menu";
import TechnicalFilterModal from "./technical-filter-modal";

const STATIC_BRANDS = [
  "EMMARK",
  "DAI",
  "FERSA",
  "EDTPART",
  "KANADIAN",
  "BW",
  "PFI",
  "RYCO",
  "KOMAN",
  "GABRIEL",
  "BEZARES",
  "SAKURA",
  "WEGA",
];

const NavDropdown = ({ label, items, icon: Icon, color, onSelect }: any) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-sky-950 hover:border-sky-500 hover:text-sky-600 transition-all shadow-sm active:scale-95">
        <Icon size={14} className={color} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] italic">
          {label}
        </span>
        <ChevronDown
          size={12}
          className="opacity-50 group-hover:rotate-180 transition-transform"
        />
      </button>

      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-[10px] font-bold text-slate-400 uppercase italic">
              Cargando...
            </div>
          ) : (
            items.map((item: string) => (
              <button
                key={item}
                onClick={() => onSelect(item)}
                className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors uppercase italic"
              >
                {item}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicProductTypes, setDynamicProductTypes] = useState<string[]>([]);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "tractor" | "motor" | null;
  }>({ isOpen: false, type: null });

  const router = useRouter();
  const cart = useCart();
  const { lovedItems } = useLovedProducts();

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await fetch(
          `https://ixoye-backend-production.up.railway.app/api/products?fields[0]=productType&pagination[pageSize]=100`,
        );
        const json = await res.json();
        if (json.data) {
          const types = json.data.map(
            (item: any) => (item.attributes || item).productType,
          );
          const uniqueTypes = Array.from(
            new Set(types.filter(Boolean)),
          ) as string[];
          setDynamicProductTypes(uniqueTypes.sort());
        }
      } catch (error) {
        console.error("Error cargando tipos de producto:", error);
      }
    };
    fetchProductTypes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setOpen(false);
    }
  };

  const handleStaticSelect = (val: string, param: string) => {
    router.push(`/category?${param}=${encodeURIComponent(val.toLowerCase())}`);
    setOpen(false);
  };

  const iconClass =
    "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 transform hover:scale-110 hover:bg-white text-sky-950 min-w-[70px]";
  const navTextClass =
    "text-[9px] font-black uppercase italic tracking-wider text-center";

  return (
    <header className="w-full bg-slate-50 border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-20 md:h-[110px] gap-8">
        {/* LOGO */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-4 group">
            <img
              src="/logo-ixoye.png"
              className="h-10 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:rotate-[-2deg]"
              alt="logo"
            />
            <div className="hidden lg:flex flex-col justify-center">
              <h1 className="text-sky-950 font-black text-xl tracking-tighter leading-none uppercase italic">
                Refacciones
              </h1>
              <span className="text-sky-500 font-bold text-[10px] uppercase tracking-[0.3em] leading-tight">
                Diesel y Agrícola
              </span>
            </div>
          </Link>
        </div>

        {/* BÚSQUEDA DESKTOP */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-lg relative group"
        >
          <input
            type="text"
            placeholder="Nombre, OEM, Serie o Marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all text-sky-950 font-medium placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-sky-900 text-white rounded-xl hover:bg-sky-950 transition-colors shadow-md"
          >
            <Search size={20} />
          </button>
        </form>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex gap-1 items-center">
          <Link href="/category" className={iconClass}>
            <Store className="w-7 h-7" />
            <span className={navTextClass}>Tienda</span>
          </Link>
          <Link href="/profile" className={iconClass}>
            <UserRound className="w-7 h-7" />
            <span className={navTextClass}>Perfil</span>
          </Link>
          <Link href="/loved-product" className={iconClass}>
            <Heart
              className={`w-7 h-7 transition-colors ${lovedItems.length > 0 ? "fill-sky-950 text-sky-950" : ""}`}
            />
            <span className={navTextClass}>Favoritos</span>
          </Link>
          <Link href="/cart" className={`relative ${iconClass}`}>
            {cart.items.length === 0 ? (
              <ShoppingCart className="w-7 h-7" />
            ) : (
              <BaggageClaim
                strokeWidth={2.5}
                className="w-7 h-7 text-sky-950"
              />
            )}
            <span className={navTextClass}>Carrito</span>
            {cart.items.length > 0 && (
              <span className="absolute top-1 right-2 bg-sky-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cart.items.length}
              </span>
            )}
          </Link>
          <div className={iconClass}>
            <SupportMenu />
            <span className={navTextClass}>Soporte</span>
          </div>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl text-sky-950 hover:bg-white transition"
        >
          {open ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* FILTROS DESKTOP */}
      <div className="hidden md:flex justify-center items-center gap-3 pb-5 pt-1">
        <NavDropdown
          label="Producto"
          items={dynamicProductTypes}
          icon={Package}
          color="text-emerald-500"
          onSelect={(val: string) => handleStaticSelect(val, "category")}
        />
        <NavDropdown
          label="Marcas"
          items={STATIC_BRANDS}
          icon={ShieldCheck}
          color="text-rose-500"
          onSelect={(val: string) => handleStaticSelect(val, "brand")}
        />
      </div>

      <TechnicalFilterModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
      />

      {/* MENU MOBILE */}
      {open && (
        <div className="md:hidden fixed inset-0 top-20 bg-slate-50 z-[100] overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="p-6 space-y-8 pb-24">
            {/* BUSQUEDA MOBILE */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="¿Qué refacción necesitas?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-900"
                size={20}
              />
            </form>

            {/* NAVEGACIÓN PRINCIPAL MOBILE */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/category"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
              >
                <Store className="w-6 h-6 text-sky-950" />
                <span className="text-[10px] font-black uppercase italic">
                  Tienda
                </span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
              >
                <UserRound className="w-6 h-6 text-sky-950" />
                <span className="text-[10px] font-black uppercase italic">
                  Mi Perfil
                </span>
              </Link>
              <Link
                href="/loved-product"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm relative"
              >
                <Heart
                  className={`w-6 h-6 ${lovedItems.length > 0 ? "fill-sky-950 text-sky-950" : "text-sky-950"}`}
                />
                <span className="text-[10px] font-black uppercase italic">
                  Favoritos
                </span>
                {lovedItems.length > 0 && (
                  <span className="absolute top-3 right-8 w-2 h-2 bg-sky-500 rounded-full" />
                )}
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm relative"
              >
                <ShoppingCart className="w-6 h-6 text-sky-950" />
                <span className="text-[10px] font-black uppercase italic">
                  Carrito
                </span>
                {cart.items.length > 0 && (
                  <span className="absolute top-3 right-8 bg-sky-600 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full">
                    {cart.items.length}
                  </span>
                )}
              </Link>
            </div>

            {/* FILTROS MOBILE */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <p className="text-[10px] font-black text-sky-950 uppercase tracking-[0.2em] italic">
                Explorar por
              </p>

              <div className="space-y-3">
                <details className="group">
                  <summary className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 text-emerald-700 list-none cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Package size={18} />
                      <span className="text-[11px] font-black uppercase italic">
                        Tipos de Producto
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className="group-open:rotate-180 transition-transform"
                    />
                  </summary>
                  <div className="grid grid-cols-1 gap-1 mt-2 pl-4 border-l-2 border-emerald-100">
                    {dynamicProductTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleStaticSelect(type, "category")}
                        className="text-left py-3.5 text-[10px] font-bold text-slate-600 uppercase italic border-b border-slate-100 last:border-0"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 text-rose-700 list-none cursor-pointer">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} />
                      <span className="text-[11px] font-black uppercase italic">
                        Nuestras Marcas
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className="group-open:rotate-180 transition-transform"
                    />
                  </summary>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 pl-4 border-l-2 border-rose-100">
                    {STATIC_BRANDS.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleStaticSelect(brand, "brand")}
                        className="text-left py-3.5 text-[10px] font-bold text-slate-600 uppercase italic border-b border-slate-100"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            {/* SOPORTE MOBILE */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Headset size={16} className="text-sky-600" />
                <p className="text-[10px] font-black text-sky-950 uppercase tracking-[0.2em] italic">
                  Atención al Cliente
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <a
                  href="https://wa.me/3111234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={20} />
                    <span className="text-[11px] font-black uppercase tracking-widest italic">
                      WhatsApp
                    </span>
                  </div>
                  <ChevronDown size={16} className="-rotate-90 opacity-50" />
                </a>

                <a
                  href="mailto:soporte@refaccionesixoye.mx"
                  className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-sky-950 text-white shadow-lg shadow-sky-100 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={20} />
                    <span className="text-[11px] font-black uppercase tracking-widest italic">
                      Enviar Correo
                    </span>
                  </div>
                  <ChevronDown size={16} className="-rotate-90 opacity-50" />
                </a>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase italic mt-6">
                Horario de Atención: Lun - Vie / 9:00 - 18:00, Sab / 9:00 - 2:00
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
