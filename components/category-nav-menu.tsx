"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDashed,
  CircleDot,
  Cog,
  Disc,
  Droplets,
  Funnel,
  Hammer,
  LayoutGrid,
  LifeBuoy,
  Link2,
  Lock,
  Navigation,
  Package,
  Plug,
  Snowflake,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { categoryLabel, typeLabel, useCategoryTree, type CategoryTree } from "@/lib/category-tree";
import NavMenu from "./nav-menu";
import NavMenuSearch, { NoResults, matchesSearch } from "./nav-menu-search";

// Menu "Categoria" de la barra "Busqueda por:". Abre mostrando solo las
// categorias (con buscador); al elegir una aparecen sus tipos de producto.

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  BALERO: CircleDot,
  BOMBA: Droplets,
  BUJE: Circle,
  CONEXIONES: Link2,
  DIRECCION: Navigation,
  ELECTRICO: Zap,
  ENFRIAMENTO: Snowflake,
  FILTRACION: Funnel,
  FRENOS: Disc,
  FUNDICION: Hammer,
  HIDRAULICO: Waves,
  MISCELANEO: Package,
  MOTOR: Cog,
  RETEN: CircleDashed,
  RUEDA: LifeBuoy,
  SEGUROS: Lock,
  TAPONES: Plug,
};

const iconFor = (name: string) => CATEGORY_ICONS[name.toUpperCase()] ?? Package;

const filterTree = (tree: CategoryTree, query: string) =>
  tree.filter((c) => matchesSearch(query, categoryLabel(c.name), c.name, ...c.types.map((t) => t.name)));

function useGoToCategory(onNavigate?: () => void) {
  const router = useRouter();
  return (category: string, productType?: string) => {
    const params = new URLSearchParams({ category });
    if (productType) params.set("productType", productType);
    router.push(`/category?${params.toString()}`);
    onNavigate?.();
  };
}

const countClass = "text-[10px] font-bold tabular-nums text-slate-400 dark:text-slate-500";
const typeItemClass =
  "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-[#0055a4] dark:hover:text-sky-400 transition-colors";

// El contenido del panel vive en su propio componente: NavMenu solo lo monta
// mientras esta abierto, asi la busqueda y la seleccion empiezan limpias cada vez.
function CategoryPanel({ tree, onNavigate }: { tree: CategoryTree; onNavigate: () => void }) {
  const go = useGoToCategory(onNavigate);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  const visible = filterTree(tree, query);
  const current = tree.find((c) => c.name === selected);

  return (
    <div className={`flex divide-x divide-slate-100 dark:divide-slate-700 ${current ? "w-[760px]" : "w-[300px]"} max-w-[90vw]`}>
      <div className={`flex flex-col ${current ? "w-[260px] shrink-0 bg-slate-50/60 dark:bg-slate-900/40" : "w-full"}`}>
        <div className="p-3 pb-2">
          <NavMenuSearch value={query} onChange={setQuery} placeholder="Buscar categoría o tipo..." autoFocus />
        </div>
        <div className="px-2 pb-2 max-h-[400px] overflow-y-auto">
          {visible.length === 0 ? (
            <NoResults query={query} />
          ) : (
            visible.map((c) => {
              const Icon = iconFor(c.name);
              const active = c.name === selected;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelected(c.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                    active
                      ? "bg-white dark:bg-slate-800 shadow-sm text-[#0055a4] dark:text-sky-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-[#0055a4] dark:hover:text-sky-400"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                      active ? "bg-[#0055a4] text-white" : "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{categoryLabel(c.name)}</span>
                  <span className={countClass}>{c.count}</span>
                  <ChevronRight size={14} className={`shrink-0 ${active ? "opacity-70" : "opacity-30"}`} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {current && (
        <div className="flex-1 p-4 max-h-[460px] overflow-y-auto">
          <h3 className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-700 text-lg font-black uppercase italic tracking-tighter text-[#003366] dark:text-sky-400">
            {categoryLabel(current.name)}
          </h3>
          {current.types.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Esta categoría todavía no tiene tipos de producto.
            </p>
          )}
          <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
            {current.types.map((t) => (
              <button key={t.name} onClick={() => go(current.name, t.name)} className={typeItemClass}>
                <span className="truncate">{typeLabel(t.name)}</span>
                <span className={countClass}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

export function CategoryDropdown({ open, onToggle, onNavigate }: Props) {
  const { tree, error } = useCategoryTree();

  return (
    <NavMenu label="Categoría" icon={LayoutGrid} open={open} onToggle={onToggle} panelClassName="w-auto">
      {tree ? (
        <CategoryPanel tree={tree} onNavigate={onNavigate} />
      ) : (
        <div className="w-[300px] p-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase italic">
          {error ? "No disponible" : "Cargando..."}
        </div>
      )}
    </NavMenu>
  );
}

// Version del menu movil: buscador + un acordeon por categoria con sus tipos.
export function MobileCategoryMenu({ onNavigate }: { onNavigate: () => void }) {
  const { tree } = useCategoryTree();
  const go = useGoToCategory(onNavigate);
  const [query, setQuery] = useState("");
  const visible = tree ? filterTree(tree, query) : [];

  return (
    <details className="group">
      <summary className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 list-none cursor-pointer">
        <div className="flex items-center gap-3">
          <LayoutGrid size={18} />
          <span className="text-[11px] font-black uppercase italic">Por Categoría</span>
        </div>
        <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
      </summary>
      <div className="mt-2 pl-4 border-l-2 border-emerald-100 dark:border-emerald-800">
        {!tree ? (
          <p className="py-3 text-xs text-slate-400">Cargando...</p>
        ) : (
          <>
            <div className="py-2">
              <NavMenuSearch value={query} onChange={setQuery} placeholder="Buscar categoría o tipo..." />
            </div>
            {visible.length === 0 && (
              <NoResults query={query} />
            )}
            {visible.map((c) => {
              const Icon = iconFor(c.name);
              return (
                <details key={c.name} className="group/cat border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <summary className="flex items-center gap-3 py-3 list-none cursor-pointer text-slate-800 dark:text-slate-200">
                    <Icon size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="flex-1 text-sm font-bold">{categoryLabel(c.name)}</span>
                    <span className={countClass}>{c.count}</span>
                    <ChevronDown size={14} className="group-open/cat:rotate-180 transition-transform" />
                  </summary>
                  <div className="grid grid-cols-2 gap-x-3 pl-7 pb-2">
                    {c.types.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => go(c.name, t.name)}
                        className="flex items-center justify-between gap-2 text-left py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700"
                      >
                        <span className="truncate">{typeLabel(t.name)}</span>
                        <span className={countClass}>{t.count}</span>
                      </button>
                    ))}
                  </div>
                </details>
              );
            })}
          </>
        )}
      </div>
    </details>
  );
}
