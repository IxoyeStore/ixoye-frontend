"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Cog, Tractor } from "lucide-react";
import { useFitmentTree, vehicleToParams, type FitmentTree, type SavedVehicle } from "@/lib/vehicle";
import NavMenu from "./nav-menu";
import NavMenuSearch, { NoResults, matchesSearch } from "./nav-menu-search";

// Menus "Tractor" (Marca -> Serie -> Modelo) y "Motor" (Marca -> Motor) de la
// barra "Busqueda por:". Igual que "Categoria": abren mostrando solo las marcas
// (con buscador) y cada columna siguiente aparece al elegir en la anterior.

interface MenuProps {
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

type MakeOnly = { kind: "make"; make: string };

function useGoToVehicle(onNavigate?: () => void) {
  const router = useRouter();
  return (v: SavedVehicle | MakeOnly) => {
    const params = v.kind === "make" ? { make: v.make } : vehicleToParams(v);
    router.push(`/category?${new URLSearchParams(params).toString()}`);
    onNavigate?.();
  };
}

const countClass = "text-[10px] font-bold tabular-nums text-slate-400 dark:text-slate-500";
const columnTitleClass =
  "px-3 pt-3 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500";
const listItemClass = (active: boolean) =>
  `w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm font-semibold transition-colors ${
    active
      ? "bg-white dark:bg-slate-800 shadow-sm text-[#0055a4] dark:text-sky-400"
      : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-[#0055a4] dark:hover:text-sky-400"
  }`;
const leafItemClass =
  "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-[#0055a4] dark:hover:text-sky-400 transition-colors";
const loadingClass = "w-[300px] p-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase italic";

function ListItem({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={listItemClass(active)}>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && <span className={countClass}>{count}</span>}
      <ChevronRight size={14} className={`shrink-0 ${active ? "opacity-70" : "opacity-30"}`} />
    </button>
  );
}

function AllItem({ count, onClick }: { count?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className={leafItemClass}>
      <span className="truncate font-semibold">Todos</span>
      {count !== undefined && <span className={countClass}>{count}</span>}
    </button>
  );
}

// Los paneles viven en su propio componente: NavMenu solo los monta mientras
// estan abiertos, asi la busqueda y la seleccion empiezan limpias cada vez.
function TractorPanel({ tree, onNavigate }: { tree: FitmentTree; onNavigate: () => void }) {
  const go = useGoToVehicle(onNavigate);
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [series, setSeries] = useState("");

  const makes = tree.makes.filter((m) =>
    matchesSearch(query, m.name, ...m.series.flatMap((s) => [s.name, ...s.models])),
  );
  const currentMake = tree.makes.find((m) => m.name === make);
  const currentSeries = currentMake?.series.find((s) => s.name === series);
  const width = currentSeries ? "w-[880px]" : currentMake ? "w-[540px]" : "w-[300px]";

  return (
    <div className={`flex divide-x divide-slate-100 dark:divide-slate-700 max-w-[90vw] ${width}`}>
      <div className={`flex flex-col ${currentMake ? "w-[260px] shrink-0 bg-slate-50/60 dark:bg-slate-900/40" : "w-full"}`}>
        <div className="p-3 pb-2">
          <NavMenuSearch value={query} onChange={setQuery} placeholder="Buscar marca, serie o modelo..." autoFocus />
        </div>
        <div className="px-2 pb-2 max-h-[400px] overflow-y-auto">
          {makes.length === 0 ? (
            <NoResults query={query} />
          ) : (
            makes.map((m) => (
              <ListItem
                key={m.name}
                label={m.name}
                count={m.count}
                active={m.name === make}
                onClick={() => { setMake(m.name); setSeries(""); }}
              />
            ))
          )}
        </div>
      </div>

      {currentMake && (
        <div className={`flex flex-col ${currentSeries ? "w-[280px] shrink-0 bg-slate-50/60 dark:bg-slate-900/40" : "flex-1"}`}>
          <p className={columnTitleClass}>Serie</p>
          <div className="px-2 pb-2 max-h-[420px] overflow-y-auto">
            <AllItem count={currentMake.count} onClick={() => go({ kind: "tractor", make: currentMake.name })} />
            {currentMake.series.map((s) => (
              <ListItem
                key={s.name}
                label={s.name}
                count={s.count}
                active={s.name === series}
                onClick={() => setSeries(s.name)}
              />
            ))}
          </div>
        </div>
      )}

      {currentMake && currentSeries && (
        <div className="flex-1 flex flex-col">
          <p className={columnTitleClass}>Modelo</p>
          <div className="px-2 pb-2 max-h-[420px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-x-1 gap-y-0.5">
              <AllItem
                count={currentSeries.count}
                onClick={() => go({ kind: "tractor", make: currentMake.name, series: currentSeries.name })}
              />
              {currentSeries.models.map((mo) => (
                <button
                  key={mo}
                  onClick={() => go({ kind: "tractor", make: currentMake.name, series: currentSeries.name, model: mo })}
                  className={leafItemClass}
                >
                  <span className="truncate">{mo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnginePanel({ tree, onNavigate }: { tree: FitmentTree; onNavigate: () => void }) {
  const go = useGoToVehicle(onNavigate);
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");

  const makes = tree.engines.filter((g) => matchesSearch(query, g.make, ...g.engines.map((e) => e.name)));
  const current = tree.engines.find((g) => g.make === make);

  return (
    <div className={`flex divide-x divide-slate-100 dark:divide-slate-700 max-w-[90vw] ${current ? "w-[640px]" : "w-[300px]"}`}>
      <div className={`flex flex-col ${current ? "w-[260px] shrink-0 bg-slate-50/60 dark:bg-slate-900/40" : "w-full"}`}>
        <div className="p-3 pb-2">
          <NavMenuSearch value={query} onChange={setQuery} placeholder="Buscar marca o motor..." autoFocus />
        </div>
        <div className="px-2 pb-2 max-h-[400px] overflow-y-auto">
          {makes.length === 0 ? (
            <NoResults query={query} />
          ) : (
            makes.map((g) => (
              <ListItem key={g.make} label={g.make} count={g.count} active={g.make === make} onClick={() => setMake(g.make)} />
            ))
          )}
        </div>
      </div>

      {current && (
        <div className="flex-1 flex flex-col">
          <p className={columnTitleClass}>Motor</p>
          <div className="px-2 pb-2 max-h-[420px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
              <AllItem count={current.count} onClick={() => go({ kind: "make", make: current.make })} />
              {current.engines.map((en) => (
                <button
                  key={en.name}
                  onClick={() => go({ kind: "engine", make: current.make, engine: en.name })}
                  className={leafItemClass}
                >
                  <span className="truncate">{en.name}</span>
                  <span className={countClass}>{en.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TractorDropdown({ open, onToggle, onNavigate }: MenuProps) {
  const { tree, error } = useFitmentTree();
  return (
    <NavMenu label="Tractor" icon={Tractor} open={open} onToggle={onToggle} panelClassName="w-auto">
      {tree ? <TractorPanel tree={tree} onNavigate={onNavigate} /> : <div className={loadingClass}>{error ? "No disponible" : "Cargando..."}</div>}
    </NavMenu>
  );
}

export function EngineDropdown({ open, onToggle, onNavigate }: MenuProps) {
  const { tree, error } = useFitmentTree();
  return (
    <NavMenu label="Motor" icon={Cog} open={open} onToggle={onToggle} panelClassName="w-auto">
      {tree ? <EnginePanel tree={tree} onNavigate={onNavigate} /> : <div className={loadingClass}>{error ? "No disponible" : "Cargando..."}</div>}
    </NavMenu>
  );
}

// Version del menu movil: buscador + acordeones anidados, con el mismo estilo
// que "Por Categoria" y "Nuestras Marcas".
const mobileSummaryClass =
  "flex items-center gap-2 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 list-none cursor-pointer";
const mobileLeafClass =
  "flex items-center justify-between gap-2 text-left py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700";
const mobileAllClass = mobileLeafClass.replace("font-medium", "font-bold");

export function MobileTractorMenu({ onNavigate }: { onNavigate: () => void }) {
  const { tree } = useFitmentTree();
  const go = useGoToVehicle(onNavigate);
  const [query, setQuery] = useState("");
  const makes = tree?.makes.filter((m) =>
    matchesSearch(query, m.name, ...m.series.flatMap((s) => [s.name, ...s.models])),
  ) ?? [];

  return (
    <details className="group">
      <summary className="flex items-center justify-between p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 list-none cursor-pointer">
        <div className="flex items-center gap-3">
          <Tractor size={18} />
          <span className="text-[11px] font-black uppercase italic">Por Tractor</span>
        </div>
        <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
      </summary>
      <div className="mt-2 pl-4 border-l-2 border-sky-100 dark:border-sky-800">
        {!tree ? (
          <p className="py-3 text-xs text-slate-400">Cargando...</p>
        ) : (
          <>
            <div className="py-2">
              <NavMenuSearch value={query} onChange={setQuery} placeholder="Buscar marca, serie o modelo..." />
            </div>
            {makes.length === 0 && <NoResults query={query} />}
            {makes.map((m) => (
              <details key={m.name} className="group/make border-b border-slate-100 dark:border-slate-700 last:border-0">
                <summary className={mobileSummaryClass}>
                  <span className="flex-1">{m.name}</span>
                  <span className={countClass}>{m.count}</span>
                  <ChevronDown size={14} className="group-open/make:rotate-180 transition-transform" />
                </summary>
                <div className="flex flex-col pl-3 pb-2">
                  <button onClick={() => go({ kind: "tractor", make: m.name })} className={mobileAllClass}>
                    <span>Todos</span>
                    <span className={countClass}>{m.count}</span>
                  </button>
                  {m.series.map((s) => (
                    <details key={s.name} className="group/series">
                      <summary className={mobileSummaryClass}>
                        <span className="flex-1">{s.name}</span>
                        <span className={countClass}>{s.count}</span>
                        <ChevronDown size={14} className="group-open/series:rotate-180 transition-transform" />
                      </summary>
                      <div className="grid grid-cols-3 gap-x-2 pl-3 pb-2">
                        <button onClick={() => go({ kind: "tractor", make: m.name, series: s.name })} className={mobileAllClass}>
                          Todos
                        </button>
                        {s.models.map((mo) => (
                          <button
                            key={mo}
                            onClick={() => go({ kind: "tractor", make: m.name, series: s.name, model: mo })}
                            className={mobileLeafClass}
                          >
                            {mo}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </>
        )}
      </div>
    </details>
  );
}

export function MobileEngineMenu({ onNavigate }: { onNavigate: () => void }) {
  const { tree } = useFitmentTree();
  const go = useGoToVehicle(onNavigate);
  const [query, setQuery] = useState("");
  const makes = tree?.engines.filter((g) => matchesSearch(query, g.make, ...g.engines.map((e) => e.name))) ?? [];

  return (
    <details className="group">
      <summary className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 list-none cursor-pointer">
        <div className="flex items-center gap-3">
          <Cog size={18} />
          <span className="text-[11px] font-black uppercase italic">Por Motor</span>
        </div>
        <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
      </summary>
      <div className="mt-2 pl-4 border-l-2 border-amber-100 dark:border-amber-800">
        {!tree ? (
          <p className="py-3 text-xs text-slate-400">Cargando...</p>
        ) : (
          <>
            <div className="py-2">
              <NavMenuSearch value={query} onChange={setQuery} placeholder="Buscar marca o motor..." />
            </div>
            {makes.length === 0 && <NoResults query={query} />}
            {makes.map((g) => (
              <details key={g.make} className="group/make border-b border-slate-100 dark:border-slate-700 last:border-0">
                <summary className={mobileSummaryClass}>
                  <span className="flex-1">{g.make}</span>
                  <span className={countClass}>{g.count}</span>
                  <ChevronDown size={14} className="group-open/make:rotate-180 transition-transform" />
                </summary>
                <div className="grid grid-cols-2 gap-x-3 pl-3 pb-2">
                  <button onClick={() => go({ kind: "make", make: g.make })} className={mobileAllClass}>
                    <span>Todos</span>
                    <span className={countClass}>{g.count}</span>
                  </button>
                  {g.engines.map((en) => (
                    <button
                      key={en.name}
                      onClick={() => go({ kind: "engine", make: g.make, engine: en.name })}
                      className={mobileLeafClass}
                    >
                      <span className="truncate">{en.name}</span>
                      <span className={countClass}>{en.count}</span>
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </>
        )}
      </div>
    </details>
  );
}
