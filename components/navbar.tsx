/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Store,
  Menu,
  X,
  BaggageClaim,
  Heart,
  UserRound,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();
  const { lovedItems } = useLovedProducts();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconClass =
    "p-2 rounded-xl transition-all duration-300 transform hover:scale-110 hover:bg-blue-50 hover:text-blue-600";

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-500
      ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-blue-100/50 py-1"
          : "bg-transparent py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16 md:h-[82px]">
        {/* SECCIÓN IZQUIERDA: LOGO Y NOMBRE */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-ixoye.png"
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              alt="logo"
            />

            <div className="flex flex-col justify-center mt-1">
              <h1 className="hidden md:block text-[#0055a4] font-black mt-5 md:text-lg tracking-tighter leading-none whitespace-nowrap">
                REFACCIONES DIESEL Y AGRICOLA IXOYE
              </h1>

              {/* NOMBRE CORTO MOBILE*/}
              <h1 className="md:hidden text-[#0055a4] font-black text-base tracking-tight leading-none">
                REFACCIONES IXOYE
              </h1>
            </div>
          </Link>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex gap-2 lg:gap-4 items-center text-[#0055a4] ml-4">
          <div className="h-6 border-l border-blue-300 mx-2" />

          <Link href="/category" aria-label="Tienda" className={iconClass}>
            <Store className="w-8 h-8 lg:w-9 lg:h-9" />
          </Link>

          <Link href="/profile" aria-label="Perfil" className={iconClass}>
            <UserRound className="w-8 h-8 lg:w-9 lg:h-9" />
          </Link>

          <Link
            href="/cart"
            aria-label="Carrito"
            className={`relative ${iconClass}`}
          >
            {cart.items.length === 0 ? (
              <ShoppingCart className="w-8 h-8 lg:w-9 lg:h-9" />
            ) : (
              <div className="flex gap-1 items-center">
                <BaggageClaim
                  strokeWidth={2}
                  className="w-8 h-8 lg:w-9 lg:h-9 text-blue-600"
                />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-md">
                  {cart.items.length}
                </span>
              </div>
            )}
          </Link>

          <Link
            href="/loved-product"
            aria-label="Favoritos"
            className={iconClass}
          >
            <Heart
              className={`w-8 h-8 lg:w-9 lg:h-9 cursor-pointer transition-colors
              ${lovedItems.length > 0 ? "fill-blue-600 text-blue-600" : ""}`}
            />
          </Link>
        </nav>

        {/* BOTÓN MENU MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-[#0055a4] hover:bg-blue-50 transition"
          aria-label="Abrir menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENU MOBILE DESPLEGABLE */}
      {open && (
        <nav className="md:hidden bg-white border-t border-blue-50 shadow-2xl flex justify-around py-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex flex-col items-center gap-1 text-[#0055a4]"
          >
            <UserRound className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Perfil
            </span>
          </Link>

          <Link
            href="/category"
            onClick={() => setOpen(false)}
            className="flex flex-col items-center gap-1 text-[#0055a4]"
          >
            <Store className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Tienda
            </span>
          </Link>

          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="relative flex flex-col items-center gap-1 text-[#0055a4]"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Carrito
            </span>
            {cart.items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">
                {cart.items.length}
              </span>
            )}
          </Link>

          <Link
            href="/loved-product"
            onClick={() => setOpen(false)}
            className="flex flex-col items-center gap-1 text-[#0055a4]"
          >
            <Heart
              className={`w-6 h-6 ${
                lovedItems.length > 0 ? "fill-blue-600 text-blue-600" : ""
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Favoritos
            </span>
          </Link>
        </nav>
      )}
    </header>
  );
}
