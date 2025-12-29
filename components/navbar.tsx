/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Store, Menu, X, BaggageClaim, Heart, User } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useLovedProducts } from "@/hooks/use-loved-products"

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cart = useCart()
  const { lovedItems } = useLovedProducts()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const iconClass =
    "p-2 rounded-md transition transform hover:scale-110 hover:bg-gray-100"

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300
      ${scrolled ? "bg-white/90 backdrop-blur-md shadow" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">

        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <img src="/logo.png" className="h-10" alt="logo" />
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex gap-6 items-center">

          <Link href="/category" aria-label="Tienda" className={iconClass}>
            <Store className="w-5 h-5" />
          </Link>

          {/* CARRITO */}
          <Link
            href="/cart"
            aria-label="Carrito"
            className={`relative ${iconClass}`}
          >
            {cart.items.length === 0 ? (
              <ShoppingCart className="w-5 h-5" />
            ) : (
              <div className="flex gap-1 items-center">
                <BaggageClaim strokeWidth={1} />
                <span className="text-xs font-medium">
                  {cart.items.length}
                </span>
              </div>
            )}
          </Link>

          {/* FAVORITOS */}
          <Link href="/loved-product" aria-label="Favoritos" className={iconClass}>
            <Heart className={`cursor-pointer 
              ${lovedItems.length > 0 
              && 'fill-black dark:fill-white'}`}/>
          </Link>

          {/* PERFIL */}
          {/* <Link href="/profile" aria-label="Perfil" className={iconClass}>
            <User className="w-5 h-5" />
          </Link> */}
        </nav>

        {/* BOTÓN MENU MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition transform hover:scale-110"
          aria-label="Abrir menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <nav className="md:hidden bg-white/95 backdrop-blur-md shadow-lg flex justify-around py-4">

          <Link
            href="/category"
            onClick={() => setOpen(false)}
            aria-label="Tienda"
            className={iconClass}
          >
            <Store className="w-6 h-6" />
          </Link>

          {/* CARRITO */}
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            aria-label="Carrito"
            className={`relative ${iconClass}`}
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.items.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full translate-x-1 -translate-y-1">
                {cart.items.length}
              </span>
            )}
          </Link>

          {/* FAVORITOS */}
          <Link
            href="/favoritos"
            onClick={() => setOpen(false)}
            aria-label="Favoritos"
            className={iconClass}
          >
            <Heart className="w-6 h-6" />
          </Link>

          {/* PERFIL */}
          {/* <Link
            href="/profile"
            onClick={() => setOpen(false)}
            aria-label="Perfil"
            className={iconClass}
          >
            <User className="w-6 h-6" />
          </Link> */}
        </nav>
      )}
    </header>
  )
}
