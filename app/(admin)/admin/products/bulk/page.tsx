"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download, Upload, FileSpreadsheet, Loader2,
  CheckCircle, XCircle, AlertCircle, Search, X, FolderOpen, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ── Column map (must match export route) ────────────────────────────────────
const COLUMNS = [
  { key: "documentId",     label: "documentId"       },
  { key: "productName",    label: "descripcion"      },
  { key: "code",           label: "codigo"           },
  { key: "imageCode",      label: "codigoImagen"     },
  { key: "slug",           label: "slug"             },
  { key: "department",     label: "departamento"     },
  { key: "subDepartment",  label: "subDepartamento"  },
  { key: "productType",    label: "tipoProducto"     },
  { key: "brand",          label: "marca"            },
  { key: "series",         label: "series"           },
  { key: "motors",         label: "motores"          },
  { key: "price",          label: "precio"           },
  { key: "wholesalePrice", label: "precioMayoreo"    },
  { key: "stock",          label: "stock"            },
  { key: "active",         label: "activo"           },
  { key: "isFeatured",     label: "destacado"        },
  { key: "freeShipping",   label: "envioGratis"      },
  { key: "description",    label: "descripcionLarga" },
  { key: "hasImages",      label: "tieneImagenes"    },
];

// ── Cloudinary auto-match (busca imágenes ya subidas por código de producto) ─
const CLOUDINARY_CLOUD = "ddiafp5c0";
const IMAGE_SUFFIXES = ["", "B", "C", "D", "E"]; // hasta 5 imágenes por producto
const IMAGE_EXTENSIONS = ["jpg", "png", "jpeg"];

function cloudinaryCandidateUrl(code: string, suffix: string, ext: string) {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${encodeURIComponent(code + suffix)}.${ext}`;
}

function imageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function findCloudinaryImages(rawCode: string): Promise<string[]> {
  const code = rawCode.trim();
  if (!code) return [];
  const found: string[] = [];
  for (const suffix of IMAGE_SUFFIXES) {
    let hit: string | null = null;
    for (const ext of IMAGE_EXTENSIONS) {
      const url = cloudinaryCandidateUrl(code, suffix, ext);
      if (await imageExists(url)) { hit = url; break; }
    }
    if (hit) found.push(hit);
  }
  return found;
}

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
  skipped?: number;
  errors: { name: string; error: string }[];
};

const EMPTY_FILTERS: Filters = { search: "", category: "", active: "", priceMin: "", priceMax: "" };

const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2.5 text-[12px] font-bold bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:border-sky-400 transition-colors dark:placeholder-slate-500";

export default function BulkProductsPage() {
  const [filters, setFilters]       = useState<Filters>(EMPTY_FILTERS);
  const [categories, setCategories] = useState<any[]>([]);
  const [count, setCount]           = useState<number | null>(null);
  const [counting, setCounting]     = useState(false);
  const [exporting, setExporting]   = useState(false);

  // Import modal state
  const [showModal, setShowModal]   = useState(false);
  const [importing, setImporting]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult]         = useState<ImportResult | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [autoAssignImages, setAutoAssignImages] = useState(false);
  const [modalMode, setModalMode]   = useState<"import" | "images">("import");

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const countDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Block ESC while importing
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => { if (importing && e.key === "Escape") e.preventDefault(); };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [showModal, importing]);

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

  const openModal = () => {
    setModalMode("import");
    setResult(null);
    setProgress(0);
    setProgressLabel("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (importing) return;
    setShowModal(false);
    setResult(null);
  };

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
  const processFile = async (file: File) => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setProgressLabel("");
    setResult(null);

    try {
      const buffer  = await file.arrayBuffer();
      const wb      = XLSX.read(buffer, { type: "array" });
      const ws      = wb.Sheets[wb.SheetNames[0]];
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
        .filter((p) => p.documentId || p.code);

      if (products.length === 0) {
        toast.error("No se encontraron filas válidas — ¿falta la columna ID o código?");
        setImporting(false);
        return;
      }

      const res: ImportResult = { total: products.length, success: 0, failed: 0, errors: [] };
      const CONCURRENCY = 10;

      const buildPayload = async (fields: Record<string, any>) => {
        const payload: Record<string, any> = {};
        if (fields.productName    !== undefined) payload.productName    = String(fields.productName);
        if (fields.code           !== undefined) payload.code           = String(fields.code).trim();
        if (fields.imageCode      !== undefined) payload.imageCode      = String(fields.imageCode).trim();
        if (fields.slug           !== undefined) payload.slug           = String(fields.slug);
        if (fields.department     !== undefined) payload.department     = String(fields.department);
        if (fields.subDepartment  !== undefined) payload.subDepartment  = String(fields.subDepartment);
        if (fields.productType    !== undefined) payload.productType    = String(fields.productType);
        if (fields.brand          !== undefined) payload.brand          = String(fields.brand);
        if (fields.series         !== undefined) payload.series         = String(fields.series);
        if (fields.motors         !== undefined) payload.motors         = fields.motors ? String(fields.motors) : null;
        if (fields.price          !== undefined) payload.price          = parseFloat(fields.price) || 0;
        if (fields.wholesalePrice !== undefined)
          payload.wholesalePrice = fields.wholesalePrice !== "" ? parseFloat(fields.wholesalePrice) : null;
        if (fields.stock          !== undefined) payload.stock          = parseInt(fields.stock) || 0;
        if (fields.active         !== undefined) payload.active         = String(fields.active).toUpperCase() === "TRUE";
        if (fields.isFeatured     !== undefined) payload.isFeatured     = String(fields.isFeatured).toUpperCase() === "TRUE";
        if (fields.freeShipping   !== undefined) payload.freeShipping   = String(fields.freeShipping).toUpperCase() === "TRUE";
        if (fields.description    !== undefined) payload.description    = String(fields.description);

        const alreadyHasImages = String(fields.hasImages).toUpperCase() === "TRUE";
        const searchCode = fields.imageCode || fields.code;
        if (autoAssignImages && searchCode && !alreadyHasImages) {
          const images = await findCloudinaryImages(String(searchCode));
          if (images.length > 0) payload.images = images;
        }

        return payload;
      };

      let completed = 0;

      for (let i = 0; i < products.length; i += CONCURRENCY) {
        const batch = products.slice(i, i + CONCURRENCY);

        await Promise.all(batch.map(async (product) => {
          const { documentId, ...fields } = product;
          const isCreate = !documentId;
          const payload = await buildPayload(fields);
          const label = String(fields.productName ?? fields.code ?? documentId);
          try {
            const upd = await fetch(
              isCreate ? "/api/admin/products" : `/api/admin/products/${documentId}`,
              {
                method: isCreate ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
            if (upd.ok) {
              res.success++;
            } else {
              const err = await upd.json().catch(() => ({}));
              res.failed++;
              res.errors.push({ name: label, error: err?.error?.message || `HTTP ${upd.status}` });
            }
          } catch {
            res.failed++;
            res.errors.push({ name: label, error: "Error de red" });
          }
          completed++;
          setProgress(Math.round((completed / products.length) * 100));
        }));

        setProgressLabel(`${Math.min(i + CONCURRENCY, products.length)} / ${products.length}`);
      }

      setResult(res);
      if (res.failed === 0) toast.success(`${res.success} productos actualizados`);
      else toast.warning(`${res.success} actualizados, ${res.failed} con error`);
    } catch {
      toast.error("Error al procesar el archivo — asegúrate de que sea un .xlsx válido");
    } finally {
      setImporting(false);
      setProgressLabel("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Update images (standalone, no Excel needed) ─────────────────────────────
  const runImageUpdate = async () => {
    setModalMode("images");
    setResult(null);
    setProgress(0);
    setProgressLabel("Buscando productos sin imágenes...");
    setShowModal(true);
    setImporting(true);

    try {
      const missing: any[] = [];
      let p = 1;
      let hasMore = true;
      while (hasMore) {
        const res = await fetch(`/api/admin/products?page=${p}&pageSize=100`);
        const data = await res.json();
        const batch = (data.data || []).filter(
          (prod: any) => !Array.isArray(prod.images) || prod.images.length === 0
        );
        missing.push(...batch);
        const pagination = data.meta?.pagination;
        hasMore = pagination ? p < pagination.pageCount : false;
        p++;
      }

      const res: ImportResult = { total: missing.length, success: 0, failed: 0, skipped: 0, errors: [] };

      if (missing.length > 0) {
        const CONCURRENCY = 10;
        let completed = 0;

        for (let i = 0; i < missing.length; i += CONCURRENCY) {
          const batch = missing.slice(i, i + CONCURRENCY);

          await Promise.all(batch.map(async (product: any) => {
            const docId = product.documentId || String(product.id);
            const label = String(product.productName ?? product.code ?? docId);
            try {
              const searchCode = product.imageCode || product.code;
              const images = await findCloudinaryImages(String(searchCode));
              if (images.length === 0) {
                res.skipped!++;
              } else {
                const upd = await fetch(`/api/admin/products/${docId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ images }),
                });
                if (upd.ok) {
                  res.success++;
                } else {
                  const err = await upd.json().catch(() => ({}));
                  res.failed++;
                  res.errors.push({ name: label, error: err?.error?.message || `HTTP ${upd.status}` });
                }
              }
            } catch {
              res.failed++;
              res.errors.push({ name: label, error: "Error de red" });
            }
            completed++;
            setProgress(Math.round((completed / missing.length) * 100));
          }));

          setProgressLabel(`${Math.min(i + CONCURRENCY, missing.length)} / ${missing.length}`);
        }
      }

      setResult(res);
      if (res.total === 0) toast.success("No hay productos sin imágenes");
      else if (res.failed === 0) toast.success(`${res.success} producto(s) actualizados con imágenes`);
      else toast.warning(`${res.success} actualizados, ${res.failed} con error`);
    } catch {
      toast.error("Error al buscar imágenes");
      setShowModal(false);
    } finally {
      setImporting(false);
      setProgressLabel("");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      processFile(file);
    } else {
      toast.error("Solo se aceptan archivos .xlsx o .xls");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 w-full md:max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">Editor Masivo</h1>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">
          Filtra, exporta a Excel, edita y vuelve a importar
        </p>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Filtros de Exportación</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
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
                      : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-sky-300 dark:hover:border-sky-600 hover:text-sky-600 dark:hover:text-sky-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
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
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {counting ? (
              <Loader2 size={13} className="animate-spin text-slate-400" />
            ) : (
              <span className={`text-2xl font-black ${count === 0 ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                {count ?? "—"}
              </span>
            )}
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              productos encontrados
            </span>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || counting || count === 0}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 transition-all shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
          >
            {exporting
              ? <Loader2 size={13} className="animate-spin" />
              : <FileSpreadsheet size={13} />}
            {exporting ? "Generando..." : `Descargar Excel${count ? ` (${count})` : ""}`}
          </button>
        </div>
      </div>

      {/* ── Warning ─────────────────────────────────────────────────────────── */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
          No modifiques ni elimines las columnas <strong>documentId</strong> y <strong>tieneImagenes</strong> del
          Excel — se usan para identificar cada producto y detectar si ya tiene imágenes al importar.
          El resto de columnas son editables. Las filas con <strong>documentId vacío</strong> (pero con
          código) se crean como productos nuevos.
        </p>
      </div>

      {/* ── Import trigger ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center shrink-0">
            <Upload size={18} className="text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Importar cambios</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              Sube el Excel modificado para actualizar los productos en masa
            </p>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 shadow-lg shadow-sky-100 dark:shadow-sky-900/20 transition-all"
        >
          <Upload size={14} />
          Subir Excel
        </button>
      </div>

      {/* ── Update images trigger ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center shrink-0">
            <RefreshCw size={18} className="text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Actualizar imágenes</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              Busca en Cloudinary por código (o por <strong>codigoImagen</strong> si el producto lo tiene definido)
              y asigna imágenes a los productos que aún no tienen
            </p>
          </div>
        </div>

        <button
          onClick={runImageUpdate}
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 shadow-lg shadow-sky-100 dark:shadow-sky-900/20 transition-all"
        >
          <RefreshCw size={14} />
          Actualizar búsqueda de imágenes
        </button>
      </div>

      {/* ── Import Modal ────────────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={importing ? undefined : closeModal}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet size={16} className="text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  {importing
                    ? (modalMode === "images" ? "Buscando imágenes..." : "Importando...")
                    : result ? "Resultado" : "Seleccionar archivo"}
                </h3>
              </div>
              {!importing && (
                <button
                  onClick={closeModal}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">

              {/* ── Pick file state ── */}
              {!importing && !result && (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      dragOver
                        ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-sky-300 dark:hover:border-sky-600"
                    }`}
                  >
                    <FileSpreadsheet size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-[12px] font-black text-slate-500 dark:text-slate-400">
                      Arrastra tu archivo aquí
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 mb-4">
                      .xlsx o .xls
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all"
                    >
                      <FolderOpen size={13} />
                      Buscar archivo
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-600 p-3 cursor-pointer hover:border-sky-300 dark:hover:border-sky-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={autoAssignImages}
                      onChange={(e) => setAutoAssignImages(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-sky-600"
                    />
                    <span>
                      <span className="block text-[11px] font-black text-slate-700 dark:text-slate-200">
                        Auto-asignar imágenes desde Cloudinary
                      </span>
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                        Busca imágenes ya subidas por código de producto (o por <strong>codigoImagen</strong> si
                        está definido, hasta 5 por producto) y las asigna solo a los productos con
                        <strong> tieneImagenes = FALSE</strong>. No sube archivos nuevos, no sobrescribe
                        productos que ya tienen imágenes.
                      </span>
                    </span>
                  </label>
                </>
              )}

              {/* ── Importing state (locked) ── */}
              {importing && (
                <div className="space-y-5">
                  <div className="flex items-center justify-center py-2">
                    <Loader2 size={36} className="animate-spin text-sky-500" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                      <div
                        className="bg-sky-500 h-2.5 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {progressLabel && (
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate text-center pt-1">
                        {progressLabel}
                      </p>
                    )}
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">
                    No cierres esta ventana hasta que termine {modalMode === "images" ? "la búsqueda" : "la importación"}
                  </p>
                </div>
              )}

              {/* ── Result state ── */}
              {result && !importing && (
                <div className="space-y-4">
                  <div className={`grid gap-3 ${result.skipped !== undefined ? "grid-cols-4" : "grid-cols-3"}`}>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{result.total}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Total</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.success}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">Exitosos</p>
                    </div>
                    {result.skipped !== undefined && (
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-slate-400 dark:text-slate-500">{result.skipped}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Sin Match</p>
                      </div>
                    )}
                    <div className={`rounded-xl p-3 text-center ${result.failed > 0 ? "bg-red-50 dark:bg-red-900/30" : "bg-slate-50 dark:bg-slate-700"}`}>
                      <p className={`text-2xl font-black ${result.failed > 0 ? "text-red-700 dark:text-red-400" : "text-slate-300 dark:text-slate-600"}`}>
                        {result.failed}
                      </p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${result.failed > 0 ? "text-red-400" : "text-slate-300 dark:text-slate-600"}`}>
                        Con Error
                      </p>
                    </div>
                  </div>

                  {result.failed === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px] font-black bg-emerald-50 dark:bg-emerald-900/30 rounded-xl px-4 py-3">
                      <CheckCircle size={15} />
                      Todos los productos fueron actualizados correctamente
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Errores:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {result.errors.map((e, i) => (
                          <div key={i} className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
                            <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                            <span className="text-[10px] font-black text-red-700 dark:text-red-400 flex-1 truncate">{e.name}</span>
                            <span className="text-[9px] text-red-400 dark:text-red-500 font-bold shrink-0">{e.error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={closeModal}
                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 dark:hover:bg-slate-100 transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
