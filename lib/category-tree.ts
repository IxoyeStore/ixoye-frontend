"use client";

import { useEffect, useState } from "react";

// Arbol que arma el backend en /api/products/category-tree:
// Categoria -> Tipos de producto, con conteos de productos activos.
export type CategoryTree = {
  name: string;
  slug: string;
  count: number;
  types: { name: string; count: number }[];
}[];

// Las categorias y tipos se capturaron en mayusculas y sin acentos. Esto es
// solo para mostrarlos; los filtros siguen usando el valor real.
const CATEGORY_LABELS: Record<string, string> = {
  BALERO: "Baleros",
  BOMBA: "Bombas",
  BUJE: "Bujes",
  CONEXIONES: "Conexiones",
  DIRECCION: "Dirección",
  ELECTRICO: "Eléctrico",
  ENFRIAMENTO: "Enfriamiento",
  FILTRACION: "Filtración",
  FRENOS: "Frenos y clutch",
  FUNDICION: "Fundición",
  HIDRAULICO: "Hidráulico",
  MISCELANEO: "Misceláneo",
  MOTOR: "Motor",
  RETEN: "Retenes",
  RUEDA: "Ruedas",
  SEGUROS: "Seguros",
  TAPONES: "Tapones",
};

export function categoryLabel(name: string) {
  return CATEGORY_LABELS[name.toUpperCase()] ?? typeLabel(name);
}

// "METALES BIELA" / "metales biela" -> "Metales biela"
export function typeLabel(name: string) {
  const lower = name.toLocaleLowerCase("es");
  return lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1);
}

let treePromise: Promise<CategoryTree> | null = null;

export function useCategoryTree() {
  const [tree, setTree] = useState<CategoryTree | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!treePromise) {
      treePromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/category-tree`).then((r) => {
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
