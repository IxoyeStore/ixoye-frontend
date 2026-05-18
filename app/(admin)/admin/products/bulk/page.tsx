"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download, Upload, FileSpreadsheet, Loader2,
  CheckCircle, XCircle, AlertCircle, Search, X,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ── Column map (must match export route) ────────────────────────────────────
const COLUMNS = [
  { key: "documentId",     label: "ID (no editar)"            },
  { key: "productName",    label: "Nombre"                    },
  { key: "code",           label: "Código"                    },
  { key: "slug",           label: "Slug"                      },
  { key: "department",     label: "Departamento"              },
  { key: "subDepartment",  label: "Sub-Departamento"          },
  { key: "productType",    label: "Tipo"                      },
  { key: "brand",          label: "Marca"                     },
  { key: "series",         label: "Series"                    },
  { key: "price",          label: "Precio Público"            },
  { key: "wholesalePrice", label: "Precio Mayoreo"            },
  { key: "stock",          label: "Stock"                     },
  { key: "active",         label: "Activo (TRUE/FALSE)"       },
  { key: "isFeatured",     label: "Destacado (TRUE/FALSE)"    },
  { key: "freeShipping",   label: "Envio Gratis (TRUE/FALSE)" },
  { key: "description",    label: "Descripción"               },
];

type Filters = {
  search: string;
  category: string;
  active: string;
  priceMin: string;
  priceMax: string;
};

type ImportResult = {
  total: number;
  success: number;
  failed: number;
  errors: { name: string; error: string }[];
};

const EMPTY_FILTERS: Filters = { search: "", category: "", active: "", priceMin: "", priceMax: "" };

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[12px] font-bold bg-white focus:outline-none focus:border-sky-400 transition-colors";

export default function BulkProductsPage() {
  const [filters, setFilters]     = useState<Filters>(EMPTY_FILTERS);
  const [categories, setCategories] = useState<any[]>([]);
  const [count, setCount]         = useState<number | null>(null);
  const [counting, setCounting]   = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult]       = useState<ImportResult | null>(null);
  const countDebounce             = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories for the dropdown
  useEffect(() => {
    fetch("/api/admin/categories?page=1")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  // Auto-count products when filters change (debounced)
  const fetchCount = useCallback(async (f: Filters) => {
    setCounting(true);
    const params = new URLSearchParams({ page: "1", pageSize: "1" });
    if (f.search)   params.set("search", f.search);
    if (f.category) params.set("category", f.category);
    if (f.active)   params.set("active", f.active);
    if (f.priceMin) params.set("priceMin", f.priceMin);
    if (f.priceMax) params.set("priceMax", f.priceMax);
    try {
      const res  = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setCount(data.meta?.pagination?.total ?? 0);
    } catch {
      setCount(null);
    } finally {
      setCounting(false);
    }
  }, []);

  useEffect(() => {
    if (countDebounce.current) clearTimeout(countDebounce.current);
    countDebounce.current = setTimeout(() => fetchCount(filters), 450);
    return () => { if (countDebounce.current) clearTimeout(countDebounce.current); };
  }, [filters, fetchCount]);

  const set = (field: keyof Filters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFilters((f) => ({ ...f, [field]: e.target.value }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const hasFilters = Object.values(filters).some(Boolean);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (count === 0) { toast.error("No hay productos con los filtros seleccionados"); return; }
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.search)   params.set("search",   filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.active)   params.set("active",   filters.active);
      if (filters.priceMin) params.set("priceMin", filters.priceMin);
      if (filters.priceMax) params.set("priceMax", filters.priceMax);

      const res = await fetch(`/api/admin/products/export?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "Error al generar el Excel");
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `productos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Excel generado y descargado");
    } catch {
      toast.error("Error al descargar el archivo");
    } finally {
      setExporting(false);
    }
  };

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setProgressLabel("");
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb     = XLSX.read(buffer, { type: "array" });
      const ws     = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

      if (rawRows.length < 2) {
        toast.error("El archivo está vacío o sin filas de datos");
        setImporting(false);
        return;
      }

      const headerRow = rawRows[0] as string[];
      const colMap: Record<number, string> = {};
      headerRow.forEach((label, i) => {
        const col = COLUMNS.find((c) => c.label === label);
        if (col) colMap[i] = col.key;
      });

      const products = (rawRows.slice(1) as any[][])
        .map((row) => {
          const obj: Record<string, any> = {};
          row.forEach((val, i) => { if (colMap[i]) obj[colMap[i]] = val; });
          return obj;
        })
        .filter((p) => p.documentId);

      if (products.length === 0) {
        toast.error("No se encontraron filas válidas — ¿falta la columna ID?");
        setImporting(false);
        return;
      }

      const res: ImportResult = { total: products.length, success: 0, failed: 0, errors: [] };

      for (let i = 0; i < products.length; i++) {
        const { documentId, ...fields } = products[i];
        setProgressLabel(`${i + 1} / ${products.length} — ${fields.productName ?? ""}`);

        const payload: Record<string, any> = {};
        if (fields.productName    !== undefined) payload.productName    = String(fields.productName);
        if (fields.code           !== undefined) payload.code           = String(fields.code);
        if (fields.slug           !== undefined) payload.slug           = String(fields.slug);
        if (fields.department     !== undefined) payload.department     = String(fields.department);
        if (fields.subDepartment  !== undefined) payload.subDepartment  = String(fields.subDepartment);
        if (fields.productType    !== undefined) payload.productType    = String(fields.productType);
        if (fields.brand          !== undefined) payload.brand          = String(fields.brand);
        if (fields.series         !== undefined) payload.series         = String(fields.series);
        if (fields.price          !== undefined) payload.price          = parseFloat(fields.price) || 0;
        if (fields.wholesalePrice !== undefined)
          payload.wholesalePrice = fields.wholesalePrice !== "" ? parseFloat(fields.wholesalePrice) : null;
        if (fields.stock          !== undefined) payload.stock          = parseInt(fields.stock) || 0;
        if (fields.active         !== undefined) payload.active         = String(fields.active).toUpperCase() === "TRUE";
        if (fields.isFeatured     !== undefined) payload.isFeatured     = String(fields.isFeatured).toUpperCase() === "TRUE";
        if (fields.freeShipping   !== undefined) payload.freeShipping   = String(fields.freeShipping).toUpperCase() === "TRUE";
        if (fields.description    !== undefined) payload.description    = String(fields.description);

        try {
          const upd = await fetch(`/api/admin/products/${documentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (upd.ok) {
            res.success++;
          } else {
            const err = await upd.json().catch(() => ({}));
            res.failed++;
            res.errors.push({ name: String(fields.productName ?? documentId), error: err?.error?.message || `HTTP ${upd.status}` });
          }
        } catch {
          res.failed++;
          res.errors.push({ name: String(fields.productName ?? documentId), error: "Error de red" });
        }

        setProgress(Math.round(((i + 1) / products.length) * 100));
      }

      setResult(res);
      if (res.failed === 0) toast.success(`${res.success} productos actualizados`);
      else toast.warning(`${res.success} actualizados, ${res.failed} con error`);
    } catch {
      toast.error("Error al procesar el archivo — asegúrate de que sea un .xlsx válido");
    } finally {
      setImporting(false);
      setProgressLabel("");
      e.target.value = "";
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Editor Masivo</h1>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
          Filtra, exporta a Excel, edita y vuelve a importar
        </p>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtros de Exportación</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={12} /> Limpiar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={set("search")}
              placeholder="Buscar por nombre o código..."
              className={`${inputCls} pl-9`}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
              Categoría
            </label>
            <select value={filters.category} onChange={set("category")} className={inputCls}>
              <option value="">Todas las categorías</option>
              {categories.map((c: any) => (
                <option key={c.slug} value={c.slug}>{c.categoryName}</option>
              ))}
            </select>
          </div>

          {/* Active */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
              Estado
            </label>
            <div className="flex gap-2">
              {[
                { value: "",      label: "Todos" },
                { value: "true",  label: "Activos" },
                { value: "false", label: "Inactivos" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters((f) => ({ ...f, active: opt.value }))}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    filters.active === opt.value
                      ? "bg-sky-600 text-white border-sky-600"
                      : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
              Precio mínimo (MXN)
            </label>
            <input
              type="number"
              min="0"
              value={filters.priceMin}
              onChange={set("priceMin")}
              placeholder="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
              Precio máximo (MXN)
            </label>
            <input
              type="number"
              min="0"
              value={filters.priceMax}
              onChange={set("priceMax")}
              placeholder="Sin límite"
              className={inputCls}
            />
          </div>
        </div>

        {/* Count badge */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {counting ? (
              <Loader2 size={13} className="animate-spin text-slate-400" />
            ) : (
              <span className={`text-2xl font-black ${count === 0 ? "text-red-500" : "text-slate-900"}`}>
                {count ?? "—"}
              </span>
            )}
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              productos encontrados
            </span>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || counting || count === 0}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 transition-all shadow-lg shadow-emerald-100"
          >
            {exporting
              ? <Loader2 size={13} className="animate-spin" />
              : <FileSpreadsheet size={13} />}
            {exporting ? "Generando..." : `Descargar Excel${count ? ` (${count})` : ""}`}
          </button>
        </div>
      </div>

      {/* ── Warning ─────────────────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 font-bold">
          No modifiques ni elimines la columna <strong>ID (no editar)</strong> del Excel — se usa para
          identificar cada producto al importar. El resto de columnas son editables.
        </p>
      </div>

      {/* ── Import ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
            <Upload size={18} className="text-sky-600" />
          </div>
          <div>
            <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-900">Importar cambios</h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              Sube el Excel modificado para actualizar los productos en masa
            </p>
          </div>
        </div>

        <label
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer w-fit ${
            importing
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-100"
          }`}
        >
          {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {importing ? `Importando... ${progress}%` : "Subir Excel"}
          <input type="file" accept=".xlsx,.xls" disabled={importing} onChange={handleImport} className="hidden" />
        </label>

        {importing && (
          <div className="space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progressLabel && (
              <p className="text-[10px] font-bold text-slate-500 truncate">{progressLabel}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-900">Resultado de importación</h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-slate-900">{result.total}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Total</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-emerald-700">{result.success}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">Exitosos</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${result.failed > 0 ? "bg-red-50" : "bg-slate-50"}`}>
              <p className={`text-3xl font-black ${result.failed > 0 ? "text-red-700" : "text-slate-300"}`}>
                {result.failed}
              </p>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${result.failed > 0 ? "text-red-400" : "text-slate-300"}`}>
                Con Error
              </p>
            </div>
          </div>

          {result.failed === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-black bg-emerald-50 rounded-xl px-4 py-3">
              <CheckCircle size={16} />
              Todos los productos fueron actualizados correctamente
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Errores:</p>
              <div className="max-h-56 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2.5">
                    <XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                    <span className="text-[11px] font-black text-red-700 flex-1 truncate">{e.name}</span>
                    <span className="text-[10px] text-red-400 font-bold shrink-0">{e.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
