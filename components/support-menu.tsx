"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Mail, Headset } from "lucide-react";

const SupportMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = "523111234567";
  const supportEmail = "soporte@ixoye-store.com";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Corregido: Color sky-950 para coincidir con Tienda, Perfil, Favs y Carrito
  const iconClass = `p-2 rounded-xl transition-all duration-300 transform hover:scale-110 
    text-sky-950 ${isOpen ? "bg-slate-100 scale-110" : "hover:bg-slate-50"}`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={iconClass}
        aria-label="Soporte"
      >
        {/* Tamaño ajustado para uniformidad con los otros iconos del header */}
        <Headset className="w-7 h-7" />
      </button>

      {/* Menú Desplegable */}
      <div
        className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 transition-all duration-200 origin-top-right ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-slate-50 p-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-sky-950 uppercase tracking-widest text-center">
            Atención al Cliente
          </p>
        </div>

        <div className="p-1">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-colors"
          >
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <span className="flex items-center justify-center">
                <MessageCircle size={18} />
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700">WhatsApp</span>
          </a>

          <a
            href={`mailto:${supportEmail}`}
            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <div className="bg-slate-100 p-2 rounded-lg text-sky-950">
              <span className="flex items-center justify-center">
                <Mail size={18} />
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700">Correo</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportMenu;
