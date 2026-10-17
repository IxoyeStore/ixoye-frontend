"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Boton + panel de la barra "Busqueda por:". Se abre y cierra con clic (no
// con hover) para que el panel no se cierre al salir el raton por accidente.
// Quien lo usa controla `open`, asi solo hay un menu abierto a la vez.
interface Props {
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
  open: boolean;
  onToggle: () => void;
  align?: "left" | "right";
  panelClassName?: string;
  children: ReactNode;
}

export default function NavMenu({
  label,
  icon: Icon,
  iconClassName = "text-sky-300",
  open,
  onToggle,
  align = "left",
  panelClassName = "w-96",
  children,
}: Props) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex items-center gap-2 px-5 py-2 rounded-full border text-white transition-all active:scale-95 ${
          open ? "bg-white/15 border-sky-400" : "bg-white/5 border-white/10 hover:border-sky-400 hover:bg-white/10"
        }`}
      >
        <Icon size={14} className={iconClassName} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{label}</span>
        <ChevronDown size={12} className={`opacity-40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-2 max-w-[90vw] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-[60] overflow-hidden ${panelClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
