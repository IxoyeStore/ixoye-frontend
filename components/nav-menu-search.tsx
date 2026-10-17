"use client";

import { Search, X } from "lucide-react";

// Busqueda sin acentos ni mayusculas: "piston" encuentra "PISTÓN".
export const normalizeSearch = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const matchesSearch = (query: string, ...values: string[]) => {
  const q = normalizeSearch(query.trim());
  return !q || values.some((v) => normalizeSearch(v).includes(q));
};

// Caja de busqueda de los paneles de "Busqueda por:" (Tractor, Motor, Categoria).
export default function NavMenuSearch({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export function NoResults({ query }: { query: string }) {
  return (
    <p className="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
      {query.trim() ? `Sin resultados para “${query}”` : "Aún no hay opciones disponibles"}
    </p>
  );
}
