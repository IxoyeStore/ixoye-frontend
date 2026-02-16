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

  // AJUSTE: Ahora usa text-slate-800 para que se vea sobre el fondo grisáceo suave
  const iconClass = `p-2 rounded-xl transition-all duration-300 transform hover:scale-110 
    ${
      isOpen
        ? "bg-red-600 text-white scale-110 shadow-lg"
        : "text-slate-800 hover:bg-white hover:shadow-sm"
    }`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={iconClass}
        aria-label="Soporte"
      >
        <Headset className="w-7 h-7" />
      </button>

      {/* Menú Desplegable */}
      <div
        className={`absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[70] transition-all duration-200 origin-top-right ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-slate-50 p-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest text-center italic">
            Atención al Cliente
          </p>
        </div>

        <div className="p-1">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-colors group"
          >
            <div className="bg-green-100 p-2 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <span className="flex items-center justify-center">
                <MessageCircle size={18} />
              </span>
            </div>
            <span className="text-sm font-bold text-slate-700 uppercase italic text-[11px]">
              WhatsApp
            </span>
          </a>

          <a
            href={`mailto:${supportEmail}`}
            className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-colors group"
          >
            <div className="bg-red-100 p-2 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <span className="flex items-center justify-center">
                <Mail size={18} />
              </span>
            </div>
            <span className="text-sm font-bold text-slate-700 uppercase italic text-[11px]">
              Correo
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportMenu;
