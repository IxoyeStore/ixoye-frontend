/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { Plus, Search, Pencil, Trash2, ChevronDown, X, Loader2, SlidersHorizontal, ArrowUpDown, Eye, ShoppingCart, TrendingUp, SearchIcon, LayoutList, Copy, Check } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { toast } from "sonner";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copiar código"
      className="shrink-0 p-0.5 rounded text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );
};

type EditingCellField = "price" | "wholesalePrice" | "stock";
type EditingCell = { docId: string; field: EditingCellField };

const EditableCell = ({
  docId, field, value, format, onSave,
}: {
  docId: string;
  field: EditingCellField;
  value: number | null;
  format?: (v: number) => string;
  onSave: (docId: string, field: EditingCellField, value: number) => Promise<void>;
}) => {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setLocalValue(String(value ?? ""));
    setEditing(true);
  };

  const save = async () => {
    const parsed = field === "stock" ? parseInt(localValue) : parseFloat(localValue);
    if (isNaN(parsed)) { setEditing(false); return; }
    setSaving(true);
    await onSave(docId, field, parsed);
    setSaving(false);
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); save(); }
    if (e.key === "Escape") setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKey}
        className="w-24 text-right border border-sky-400 rounded-lg px-2 py-1 text-[11px] font-black focus:outline-none bg-sky-50 dark:bg-sky-900/30 dark:text-white"
        step={field === "stock" ? "1" : "0.01"}
        min="0"
      />
    );
  }

  return (
    <button
      onClick={startEdit}
      disabled={saving}
      title="Clic para editar"
      className={`text-right font-black rounded px-1 py-0.5 transition-all hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-700 dark:hover:text-sky-400 cursor-pointer group ${saving ? "opacity-50" : ""} ${value == null ? "text-slate-300 dark:text-slate-600" : field === "stock" ? (Number(value) <= 0 ? "text-red-500" : Number(value) <= 5 ? "text-amber-500" : "text-slate-900 dark:text-white") : field === "wholesalePrice" ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}
    >
      {value == null ? "—" : (format ? format(Number(value)) : String(value))}
      <span className="ml-1 opacity-0 group-hover:opacity-100 text-[8px] text-sky-400 transition-opacity">✎</span>
    </button>
  );
};

const BULK_ACTIONS = [
  { value: "activate", label: "Activar seleccionados", needsValue: false },
  { value: "deactivate", label: "Desactivar seleccionados", needsValue: false },
  { value: "price_pct", label: "Ajustar precio público (%)", needsValue: true, placeholder: "Ej: 10 o -5" },
  { value: "wholesale_pct", label: "Ajustar precio mayoreo (%)", needsValue: true, placeholder: "Ej: 10 o -5" },
  { value: "set_stock", label: "Establecer stock", needsValue: true, placeholder: "Cantidad exacta" },
  { value: "delete", label: "Eliminar seleccionados", needsValue: false },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Record<number, { views: number; cartAdds: number; purchases: number; searchImpressions: number; categoryImpressions: number }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("");
  const [sort, setSort] = useState("productName:asc");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [togglingActive, setTogglingActive] = useState<string | null>(null);

  // Inline editing

  // Bulk action
  const [bulkAction, setBulkAction] = useState("");
  const [bulkValue, setBulkValue] = useState("");
  const [applyingBulk, setApplyingBulk] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("search", query);
    if (active !== "") params.set("active", active);
    if (sort) params.set("sort", sort);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.data || []);
    setTotal(data.meta?.pagination?.total || 0);
    setSelected(new Set());

    fetch("/api/metrics")
      .then((r) => r.json())
      .then((m) => setMetrics(m))
      .catch(() => {});

    setLoading(false);
  }, [page, query, active, sort, priceMin, priceMax]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setQuery(""); setActive(""); setSort("productName:asc");
    setPriceMin(""); setPriceMax(""); setPage(1);
  };

  const hasActiveFilters = query || active || sort !== "productName:asc" || priceMin || priceMax;

  // --- Selection ---
  const allDocIds = products.map((p) => p.documentId || String(p.id));
  const allSelected = allDocIds.length > 0 && allDocIds.every((id) => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allDocIds));
    }
  };

  const toggleOne = (docId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(docId) ? next.delete(docId) : next.add(docId);
      return next;
    });
  };

  // --- Inline editing ---
  const handleCellSave = useCallback(async (docId: string, field: EditingCellField, parsed: number) => {
    const res = await fetch(`/api/admin/products/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: parsed }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.documentId === docId || String(p.id) === docId) ? { ...p, [field]: parsed } : p)
      );
      toast.success("Guardado");
    } else {
      toast.error("Error al guardar");
    }
  }, []);

  const toggleActive = async (docId: string, current: boolean) => {
    setTogglingActive(docId);
    const res = await fetch(`/api/admin/products/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.documentId === docId || String(p.id) === docId) ? { ...p, active: !current } : p)
      );
    } else {
      toast.error("Error al cambiar estado");
    }
    setTogglingActive(null);
  };

  const handleDelete = async (documentId: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/products/${documentId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Producto eliminado"); fetchProducts(); }
    else toast.error("Error al eliminar el producto");
  };

  // --- Bulk actions ---
  const applyBulk = async () => {
    if (!bulkAction || selected.size === 0) return;
    const action = BULK_ACTIONS.find((a) => a.value === bulkAction);
    if (!action) return;
    if (action.needsValue && !bulkValue.trim()) { toast.error("Ingresa un valor"); return; }

    if (bulkAction === "delete") {
      if (!confirm(`¿Eliminar ${selected.size} producto(s)? Esta acción no se puede deshacer.`)) return;
      setApplyingBulk(true);
      const results = await Promise.all(
        [...selected].map((docId) => fetch(`/api/admin/products/${docId}`, { method: "DELETE" }))
      );
      const failed = results.filter((r) => !r.ok).length;
      toast.success(`${selected.size - failed} eliminado(s)${failed ? `, ${failed} con error` : ""}`);
      setApplyingBulk(false);
      setBulkAction("");
      setBulkValue("");
      fetchProducts();
      return;
    }

    setApplyingBulk(true);
    const updates = [...selected].map((docId) => {
      const product = products.find((p) => (p.documentId || String(p.id)) === docId);
      if (!product) return null;

      let body: any = {};
      if (bulkAction === "activate") body = { active: true };
      else if (bulkAction === "deactivate") body = { active: false };
      else if (bulkAction === "price_pct") {
        const pct = parseFloat(bulkValue) / 100;
        body = { price: Math.round(product.price * (1 + pct) * 100) / 100 };
      } else if (bulkAction === "wholesale_pct") {
        const pct = parseFloat(bulkValue) / 100;
        const base = product.wholesalePrice || product.price;
        body = { wholesalePrice: Math.round(base * (1 + pct) * 100) / 100 };
      } else if (bulkAction === "set_stock") {
        body = { stock: parseInt(bulkValue) };
      }

      return fetch(`/api/admin/products/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }).filter(Boolean);

    const results = await Promise.all(updates as Promise<Response>[]);
    const failed = results.filter((r) => !r.ok).length;
    toast.success(`${results.length - failed} producto(s) actualizados${failed ? `, ${failed} con error` : ""}`);
    setApplyingBulk(false);
    setBulkAction("");
    setBulkValue("");
    fetchProducts();
  };

  const totalPages = Math.ceil(total / 20);
  const selectedAction = BULK_ACTIONS.find((a) => a.value === bulkAction);


  const Pagination = () =>
    totalPages > 1 ? (
      <div className="px-4 md:px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40 hover:border-sky-300 dark:hover:border-sky-600 transition-all"
          >
            ← Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40 hover:border-sky-300 dark:hover:border-sky-600 transition-all"
          >
            Siguiente →
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full md:w-[85%] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">Productos</h1>
          <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest">{total} productos en total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 dark:shadow-sky-900/30"
        >
          <Plus size={16} /> Nuevo Producto
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        {/* Row 1: search + sort + toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, código, marca..."
                className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-sky-400 w-full bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setQuery(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button type="submit" className="px-5 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-all shrink-0">
              Buscar
            </button>
          </form>

          {/* Sort */}
          <div className="relative shrink-0">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-sky-400 appearance-none sm:w-52"
            >
              <option value="productName:asc">Nombre A → Z</option>
              <option value="productName:desc">Nombre Z → A</option>
              <option value="price:asc">Precio menor primero</option>
              <option value="price:desc">Precio mayor primero</option>
              <option value="stock:asc">Stock menor primero</option>
              <option value="stock:desc">Stock mayor primero</option>
              <option value="createdAt:desc">Más recientes</option>
              <option value="createdAt:asc">Más antiguos</option>
            </select>
          </div>

          {/* Filtros toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0 ${showFilters ? "bg-sky-600 border-sky-600 text-white" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-sky-400"}`}
          >
            <SlidersHorizontal size={15} />
            Filtros
            {hasActiveFilters && <span className="bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">!</span>}
          </button>
        </div>

        {/* Row 2: expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Estado */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</label>
              <div className="flex gap-2">
                {[["", "Todos"], ["true", "Activos"], ["false", "Inactivos"]].map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setActive(val); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${active === val ? "bg-sky-600 text-white shadow-sm" : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-sky-400 hover:text-sky-600"}`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Precio (MXN)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Mínimo"
                  value={priceMin}
                  onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                  className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-sky-400 bg-white dark:bg-slate-700 dark:text-white"
                />
                <span className="text-slate-400 font-medium">—</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Máximo"
                  value={priceMax}
                  onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                  className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-sky-400 bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Limpiar */}
            {hasActiveFilters && (
              <div className="flex flex-col justify-end ml-auto">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <X size={14} /> Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk action toolbar */}
      {selected.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-sky-950 text-white rounded-2xl px-4 py-4 shadow-xl shadow-sky-900/30">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest shrink-0">
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="sm:hidden p-1.5 rounded-lg text-sky-400 hover:text-white hover:bg-sky-800 transition-all"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={bulkAction}
                onChange={(e) => { setBulkAction(e.target.value); setBulkValue(""); }}
                className="appearance-none w-full bg-sky-800 border border-sky-700 text-white rounded-xl px-4 py-2 pr-8 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">Acción masiva...</option>
                {BULK_ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-sky-300" />
            </div>
            {selectedAction?.needsValue && (
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={selectedAction.placeholder}
                className="bg-sky-800 border border-sky-700 text-white rounded-xl px-4 py-2 text-[11px] font-black focus:outline-none focus:border-sky-400 flex-1 sm:w-40 sm:flex-none placeholder:text-sky-500"
              />
            )}
            <button
              onClick={applyBulk}
              disabled={!bulkAction || applyingBulk}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 shrink-0 ${
                bulkAction === "delete"
                  ? "bg-red-500 hover:bg-red-400 text-white"
                  : "bg-white text-sky-950 hover:bg-sky-50"
              }`}
            >
              {applyingBulk ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="hidden sm:block p-1.5 rounded-lg text-sky-400 hover:text-white hover:bg-sky-800 transition-all shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Mobile card list ─────────────────────────────────────────────── */}
      <div className="sm:hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-4 h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse shrink-0" />
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-16 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">
            Sin resultados
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {products.map((p: any) => {
              const docId = p.documentId || String(p.id);
              const isSelected = selected.has(docId);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isSelected ? "bg-sky-50 dark:bg-sky-900/20" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(docId)}
                    className="w-4 h-4 rounded border-slate-300 accent-sky-600 cursor-pointer shrink-0"
                  />
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700">
                    <ProductImage
                      url={Array.isArray(p.images) && p.images[0] ? p.images[0] : undefined}
                      alt={p.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-sm shrink-0">{p.code || "—"}</span>
                      {p.code && <CopyButton text={p.code} />}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold truncate">{p.productName}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</span>
                      <span className={`text-xs font-semibold ${p.stock <= 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-500" : "text-slate-500 dark:text-slate-400"}`}>
                        Stock: {p.stock ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <Link
                      href={`/admin/products/${docId}`}
                      className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 transition-all"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(docId, p.productName)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination />
      </div>

      {/* ── Desktop table ────────────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase font-black tracking-widest bg-slate-200 dark:bg-slate-700/50">
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 accent-sky-600 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-4">Nombre</th>
                <th className="text-left px-4 py-4 hidden md:table-cell">Código</th>
                <th className="text-left px-4 py-4 hidden lg:table-cell">Categoría</th>
                <th className="text-right px-4 py-4">Precio</th>
                <th className="text-right px-4 py-4 hidden lg:table-cell">Mayoreo</th>
                <th className="text-right px-4 py-4">Stock</th>
                <th className="text-center px-4 py-4">Estado</th>
                <th className="text-center px-4 py-4 hidden lg:table-cell">Métricas</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700 [&_td]:align-middle">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                products.map((p: any) => {
                  const docId = p.documentId || String(p.id);
                  const isSelected = selected.has(docId);
                  return (
                    <tr key={p.id} className={`transition-colors ${isSelected ? "bg-sky-50 dark:bg-sky-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(docId)}
                          className="w-4 h-4 rounded border-slate-300 accent-sky-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0">
                            <ProductImage
                              url={Array.isArray(p.images) && p.images[0] ? p.images[0] : undefined}
                              alt={p.productName}
                              className="w-full h-full"
                            />
                          </div>
                          <span className="font-bold text-sm text-slate-800 dark:text-white max-w-[200px] leading-snug">{p.productName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{p.code || "—"}</span>
                          {p.code && <CopyButton text={p.code} />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{p.category?.categoryName || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <EditableCell docId={docId} field="price" value={p.price} format={formatPrice} onSave={handleCellSave} />
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <EditableCell docId={docId} field="wholesalePrice" value={p.wholesalePrice ?? null} format={formatPrice} onSave={handleCellSave} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EditableCell docId={docId} field="stock" value={p.stock} onSave={handleCellSave} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(docId, p.active)}
                          disabled={togglingActive === docId}
                          title="Clic para cambiar estado"
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 ${p.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"}`}
                        >
                          {togglingActive === docId ? <Loader2 size={11} className="animate-spin" /> : null}
                          {p.active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {(() => {
                          const m = metrics[p.id] ?? { views: 0, cartAdds: 0, purchases: 0, searchImpressions: 0, categoryImpressions: 0 };
                          return (
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                              <span title="Impresiones en búsqueda" className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <SearchIcon size={11} className="text-violet-400" />
                                {m.searchImpressions}
                              </span>
                              <span title="Impresiones en categoría" className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <LayoutList size={11} className="text-cyan-400" />
                                {m.categoryImpressions}
                              </span>
                              <span title="Vistas de producto" className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <Eye size={11} className="text-sky-400" />
                                {m.views}
                              </span>
                              <span title="Al carrito" className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <ShoppingCart size={11} className="text-amber-400" />
                                {m.cartAdds}
                              </span>
                              <span title="Compras" className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <TrendingUp size={11} className="text-emerald-400" />
                                {m.purchases}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/${docId}`} className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 transition-all">
                            <Pencil size={14} />
                          </Link>
                          <button onClick={() => handleDelete(docId, p.productName)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>
    </div>
  );
}
