"use client";

import { useEffect, useState } from "react";

// Arbol que arma el backend en /api/products/fitment-tree a partir de las
// compatibilidades de cada producto (Marca -> Serie -> Modelos, Marca -> Motores).
export type FitmentTree = {
  makes: { name: string; count: number; series: { name: string; count: number; models: string[] }[] }[];
  engines: { make: string; count: number; engines: { name: string; count: number }[] }[];
};

// Lo que el cliente eligio en los menus "Tractor" o "Motor" de "Busqueda por:".
export type SavedVehicle =
  | { kind: "tractor"; make: string; series?: string; model?: string }
  | { kind: "engine"; make: string; engine: string };

// Parametros de URL del catalogo (/category) para un vehiculo.
export function vehicleToParams(v: SavedVehicle): Record<string, string> {
  if (v.kind === "engine") return { make: v.make, engine: v.engine };
  const p: Record<string, string> = { make: v.make };
  if (v.series) p.tractorSeries = v.series;
  if (v.model) p.model = v.model;
  return p;
}

// Filtros de Strapi equivalentes. Los campos fit* guardan "|valor|valor|"
// para que "235" no coincida con "2350".
export function vehicleStrapiFilters(p: {
  make?: string | null;
  tractorSeries?: string | null;
  model?: string | null;
  engine?: string | null;
}): [string, string][] {
  const f: [string, string][] = [];
  if (!p.make) return f;
  if (p.engine) f.push(["filters[fitEngines][$contains]", `|${p.make}::${p.engine}|`]);
  else if (p.model) f.push(["filters[fitModels][$contains]", `|${p.make}::${p.model}|`]);
  else if (p.tractorSeries) f.push(["filters[fitSeries][$contains]", `|${p.make}::${p.tractorSeries}|`]);
  else f.push(["filters[fitMakes][$contains]", `|${p.make}|`]);
  return f;
}

let treePromise: Promise<FitmentTree> | null = null;

export function useFitmentTree() {
  const [tree, setTree] = useState<FitmentTree | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!treePromise) {
      treePromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/fitment-tree`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
      treePromise.catch(() => { treePromise = null; });
    }
    let cancelled = false;
    treePromise
      .then((t) => { if (!cancelled) setTree(t); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  return { tree, error };
}
