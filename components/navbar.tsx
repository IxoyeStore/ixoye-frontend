/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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

const API = "https://ixoye-backend-production.up.railway.app";

const STATIC_BRANDS = [
  { name: "EMMARK",    logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323338/EMMARK.png" },
  { name: "WEGA",      logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323342/WEGA.png" },
  { name: "SAKURA",    logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323340/SAKURA.png" },
  { name: "DAI",       logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323338/DAI.png" },
  { name: "EDTPART",   logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323338/EDTP.png" },
  { name: "GABRIEL",   logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323339/GABRIEL.png" },
  { name: "FERSA",     logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323338/fersa_logo.png" },
  { name: "KANADIAN",  logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323339/knadian_logo.jpg" },
  { name: "ZSG",       logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323342/ZSG.png" },
  { name: "PFI",       logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323340/PFI.png" },
  { name: "RYCO",      logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323339/RYCO.png" },
  { name: "KOMAN",     logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323339/KOMAN.png" },
  { name: "BEZARES",   logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779325108/BEZARES.png" },
  { name: "TOYOPOWER", logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323340/TOYOPOWER.webp" },
  { name: "BALDWIN",   logo: "https://res.cloudinary.com/ddiafp5c0/image/upload/v1779323338/BALDWIN.png" },
];

const NavDropdown = ({ label, items, icon: Icon, color, onSelect }: any) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:border-sky-400 hover:bg-white/10 transition-all active:scale-95">
        <Icon size={14} className={color} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{label}</span>
        <ChevronDown size={12} className="opacity-40 group-hover:rotate-180 transition-transform" />
      </button>
      <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-[10px] font-bold text-slate-400 uppercase italic">Cargando...</div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {items.map((item: string) => (
                <button
                  key={item}
                  onClick={() => onSelect(item)}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BrandDropdown = ({ onSelect }: { onSelect: (name: string) => void }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:border-sky-400 hover:bg-white/10 transition-all active:scale-95">
        <ShieldCheck size={14} className="text-sky-300" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Marcas</span>
        <ChevronDown size={12} className="opacity-40 group-hover:rotate-180 transition-transform" />
      </button>
      <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
        <div className="p-3 grid grid-cols-2 gap-1.5 max-h-[480px] overflow-y-auto">
          {STATIC_BRANDS.map(({ name, logo }) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sky-50 hover:border-sky-200 border border-transparent transition-all group/brand"
            >
              <div className="w-14 h-9 shrink-0 flex items-center justify-center rounded-lg p-1 bg-slate-50">
                <img src={logo} alt={name} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-sm font-semibold text-slate-800 group-hover/brand:text-sky-700 leading-tight">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

type PreviewProduct = {
  id: number;
  slug: string;
  productName: string;
  code: string;
  images: string[];
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [preview, setPreview] = useState<PreviewProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [dynamicProductTypes, setDynamicProductTypes] = useState<string[]>([]);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "tractor" | "motor" | null;
  }>({ isOpen: false, type: null });

  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();
  const { lovedItems } = useLovedProducts();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopRef  = useRef<HTMLDivElement>(null);
  const mobileRef   = useRef<HTMLDivElement>(null);

  // Close preview on navigation
  useEffect(() => {
    setShowPreview(false);
    setSearchQuery("");
  }, [pathname]);

  // Click outside → close preview
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inDesktop = desktopRef.current?.contains(e.target as Node) ?? false;
      const inMobile  = mobileRef.current?.contains(e.target as Node) ?? false;
      if (!inDesktop && !inMobile) setShowPreview(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape → close preview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPreview(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Debounced preview fetch
  const fetchPreview = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setPreview([]); setShowPreview(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.append("filters[$or][0][productName][$containsi]", q);
        params.append("filters[$or][1][code][$containsi]", q);
        params.append("filters[$or][2][series][$containsi]", q);
        params.append("filters[active][$eq]", "true");
        params.append("fields[0]", "productName");
        params.append("fields[1]", "code");
        params.append("fields[2]", "images");
        params.append("fields[3]", "slug");
        params.append("pagination[pageSize]", "5");

        const res  = await fetch(`${API}/api/products?${params}`);
        const json = await res.json();
        const items: PreviewProduct[] = (json.data || []).map((item: any) => {
          const d = item.attributes ?? item;
          return {
            id:          item.id,
            slug:        d.slug        ?? "",
            productName: d.productName ?? "",
            code:        d.code        ?? "",
            images:      Array.isArray(d.images) ? d.images : [],
          };
        });
        setPreview(items);
        setShowPreview(items.length > 0);
        if (items.length > 0) {
          fetch("/api/metrics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events: items.map((p) => ({ productId: p.id, event: "searchImpression" })) }),
          }).catch(() => {});
        }
      } catch {
        setPreview([]);
        setShowPreview(false);
      }
    }, 280);
  }, []);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    fetchPreview(val);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setPreview([]);
    setShowPreview(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      clearSearch();
      setOpen(false);
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const handlePreviewSelect = (slug: string) => {
    router.push(`/product/${slug}`);
    clearSearch();
    setOpen(false);
    (document.activeElement as HTMLElement)?.blur();
  };

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await fetch(
          `${API}/api/products?fields[0]=productType&pagination[pageSize]=100`,
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
        console.error(error);
      }
    };
    fetchProductTypes();
  }, []);

  const handleStaticSelect = (val: string, param: string) => {
    router.push(`/category?${param}=${encodeURIComponent(val.toLowerCase())}`);
    setOpen(false);
  };

  const PreviewDropdown = () =>
    showPreview ? (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[70]">
        {preview.map((p) => (
          <button
            key={p.id}
            onMouseDown={(e) => { e.preventDefault(); handlePreviewSelect(p.slug); }}
            className="w-full flex items-center gap-5 px-6 py-5 hover:bg-sky-50 transition-colors border-b border-slate-50 last:border-0 text-left"
          >
            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
              {p.images[0] ? (
                <img src={p.images[0]} alt={p.productName} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-slate-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-slate-800 truncate leading-snug">{p.productName}</p>
              {p.code && (
                <p className="text-base font-medium text-slate-400 mt-1">{p.code}</p>
              )}
            </div>
          </button>
        ))}
        <button
          onMouseDown={(e) => { e.preventDefault(); router.push(`/search?query=${encodeURIComponent(searchQuery)}`); clearSearch(); setOpen(false); }}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 hover:bg-sky-600 hover:text-white text-slate-500 transition-colors text-xs font-black uppercase tracking-widest"
        >
          <Search size={13} />
          Ver todos los resultados
        </button>
      </div>
    ) : null;

  const iconClass =
    "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 transform hover:scale-110 hover:bg-white/10 text-white/90 min-w-[70px]";
  const navTextClass =
    "text-[9px] font-black uppercase italic tracking-wider text-center";

  return (
    <>
    {showPreview && (
      <div
        className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"
        onMouseDown={() => setShowPreview(false)}
      />
    )}
    <header className="w-full sticky top-0 z-50 shadow-lg">
      {/* FRANJA SUPERIOR */}
      <div className="w-full bg-[#003366] bg-gradient-to-t from-[#0055a4] to-[#003366] text-white">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-20 md:h-24 gap-8">
          <Link href="/" className="flex items-center gap-0 group shrink-0">
            <img
              src="/logo-ixoye.png"
              className="h-10 md:h-14 w-auto object-contain brightness-0 invert"
              alt="logo"
            />
            <div className="hidden lg:flex flex-col justify-center pl-2">
              <h1 className="text-white font-black text-[21px] uppercase italic">
                Refacciones
              </h1>
              <span className="text-sky-300 font-bold text-[12px] uppercase tracking-[0.25em]">
                Diesel y Agrícola
              </span>
            </div>
          </Link>

          {/* Desktop search */}
          <div ref={desktopRef} className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearch} className="w-full relative group">
              <input
                type="text"
                placeholder="Nombre, OEM, Serie o Marca..."
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-2.5 px-6 text-white placeholder:text-white/50 focus:bg-white focus:text-slate-900 transition-all shadow-inner"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-sky-600 rounded-xl text-white hover:opacity-100 transition-opacity active:scale-95 opacity-90"
              >
                <Search size={20} className="text-white hover:text-sky-300" />
              </button>
            </form>
            <PreviewDropdown />
          </div>

          <nav className="hidden md:flex gap-1 items-center">
            <Link href="/category" className={iconClass}>
              <Store className="w-6 h-6" />
              <span className={navTextClass}>Tienda</span>
            </Link>
            <Link href="/profile" className={iconClass}>
              <UserRound className="w-6 h-6" />
              <span className={navTextClass}>Perfil</span>
            </Link>
            <Link href="/loved-product" className={iconClass}>
              <Heart
                className={`w-6 h-6 ${lovedItems.length > 0 ? "fill-red-400 text-red-400" : ""}`}
              />
              <span className={navTextClass}>Favoritos</span>
            </Link>
            <Link href="/cart" className={`relative ${iconClass}`}>
              {cart.items.length === 0 ? (
                <ShoppingCart className="w-6 h-6" />
              ) : (
                <BaggageClaim className="w-6 h-6 text-sky-300" />
              )}
              <span className={navTextClass}>Carrito</span>
              {cart.items.length > 0 && (
                <span className="absolute top-1 right-2 bg-rose-500 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border border-white animate-pulse">
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
            className="md:hidden p-2 text-white"
          >
            {open ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* FRANJA INFERIOR */}
      <div className="hidden md:flex w-full bg-[#004a99] border-b border-white/10 py-3 justify-center items-center gap-8 shadow-md">
        <div className="flex items-center gap-2 mr-4">
          <div className="h-2 w-2 bg-[#00a3e0] rounded-full shadow-[0_0_10px_rgba(0,163,224,0.4)]" />
          <span className="text-[11px] font-bold text-white uppercase tracking-widest antialiased">
            Búsqueda por:
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NavDropdown
            label="Categoría"
            items={dynamicProductTypes}
            icon={Package}
            color="text-sky-300"
            onSelect={(val: string) => handleStaticSelect(val, "category")}
          />
          <BrandDropdown onSelect={(val) => handleStaticSelect(val, "brand")} />
        </div>
      </div>

      <TechnicalFilterModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
      />

      {/* MENU MOBILE */}
      {open && (
        <div className="md:hidden fixed inset-0 top-20 bg-white z-[100] overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="p-6 space-y-8 pb-24">
            {/* BUSQUEDA MOBILE */}
            <div ref={mobileRef} className="relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="¿Qué refacción necesitas?"
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  autoComplete="off"
                />
                <Search
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-900"
                  size={20}
                />
              </form>
              <PreviewDropdown />
            </div>

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
                        className="text-left py-3.5 text-sm font-semibold text-slate-700 border-b border-slate-100 last:border-0"
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
                  <div className="grid grid-cols-2 gap-1.5 mt-2 pl-4 border-l-2 border-rose-100">
                    {STATIC_BRANDS.map(({ name, logo }) => (
                      <button
                        key={name}
                        onClick={() => { handleStaticSelect(name, "brand"); setOpen(false); }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-sky-50 hover:border-sky-200 transition-all"
                      >
                        <div className="w-12 h-8 shrink-0 flex items-center justify-center rounded-lg p-1 bg-slate-50">
                          <img src={logo} alt={name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 leading-tight">{name}</span>
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
                  href="https://wa.me/3112377582"
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
                Horario de Atención: Lun - Vie / 9:00 - 18:00, Sab / 9:00 -
                15:00
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
