/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import SkeletonSchema from "@/components/skeletonSchema";
import { ProductType } from "@/types/product";
import { CategoryType } from "@/types/category";
import { ResponeType } from "@/types/response";
import { useEffect, useState } from "react";
import ProductCard from "./[categorySlug]/components/product-card";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpDown, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, ShoppingCart } from "lucide-react";
import { useGetCategories } from "@/api/getProducts";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/hooks/use-cart";
import Link from "next/link";
import Image from "next/image";

const BRANDS = [
  "EMMARK","WEGA","SAKURA","DAI","EDTPART","GABRIEL",
  "FERSA","KANADIAN","ZSG","PFI","RYCO","KOMAN",
  "BEZARES","TOYOPOWER","BALDWIN",
];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "price:asc",      label: "Precio: Menor a Mayor" },
  { value: "price:desc",     label: "Precio: Mayor a Menor" },
  { value: "productName:asc",label: "Nombre: A-Z" },
  { value: "stock:desc",     label: "Mayor existencia" },
];

function ProductListItem({ product }: { product: ProductType }) {
  const { addItem } = useCart();

  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-slate-100 hover:border-sky-200 hover:shadow-sm transition-all rounded-xl">
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.productName}
              fill
              draggable={false}
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px] font-black uppercase">Sin imagen</div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-0.5">
          {product.code && (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
              {product.code}
            </span>
          )}
          {product.brand && (
            <span className="text-[9px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded shrink-0">
              {product.brand}
            </span>
          )}
        </div>
        <Link href={`/product/${product.slug}`}>
          <p className="text-sm font-bold text-sky-900 line-clamp-2 hover:text-sky-600 transition-colors">
            {product.productName}
          </p>
        </Link>
        {product.productType && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.productType}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="font-black text-green-600 text-lg leading-none">{formatPrice(product.price)}</p>
        <button
          onClick={() => addItem(product)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors"
        >
          <ShoppingCart size={13} />
          Agregar
        </button>
      </div>
    </div>
  );
}

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [result, setResult]           = useState<ProductType[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort]       = useState(false);
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid");
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");

  const currentSort  = searchParams.get("sort")        || "createdAt:desc";
  const category     = searchParams.get("category");
  const brand        = searchParams.get("brand");
  const series       = searchParams.get("series");
  const productName  = searchParams.get("productName");
  const priceMin     = searchParams.get("priceMin");
  const priceMax     = searchParams.get("priceMax");

  const { result: categories }: ResponeType = useGetCategories();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push("/category", { scroll: false });

  const activeFilters = [
    brand       && { key: "brand",    label: `Marca: ${brand}` },
    category    && { key: "category", label: `Tipo: ${category}` },
    series      && { key: "series",   label: `Serie: ${series}` },
    priceMin    && { key: "priceMin", label: `Desde: $${priceMin}` },
    priceMax    && { key: "priceMax", label: `Hasta: $${priceMax}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || "Ordenar";

  const fetchProducts = async (pageNumber: number) => {
    try {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const pageSize = 20;
      const params = new URLSearchParams();
      params.set("pagination[page]", String(pageNumber));
      params.set("pagination[pageSize]", String(pageSize));
      params.set("sort[0]", currentSort);
      if (category)    params.set("filters[productType][$containsi]", category);
      if (brand)       params.set("filters[brand][$containsi]", brand);
      if (series)      params.set("filters[series][$containsi]", series);
      if (productName) params.set("filters[productName][$containsi]", productName);
      if (priceMin)    params.set("filters[price][$gte]", priceMin);
      if (priceMax)    params.set("filters[price][$lte]", priceMax);

      const res  = await fetch(
        `https://ixoye-backend-production.up.railway.app/api/products?${params.toString()}`
      );
      const json = await res.json();

      const products = json.data ?? [];
      setResult(products);
      setTotalPages(json.meta.pagination.pageCount);
      setTotalCount(json.meta.pagination.total);
      if (products.length > 0) {
        fetch("/api/metrics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: products.map((p: ProductType) => ({ productId: p.id, event: "categoryImpression" })) }),
        }).catch(() => {});
      }
    } catch {
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [currentSort, category, brand, series, productName, priceMin, priceMax]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    fetchProducts(p);
  };

  const getPageNumbers = (current: number, total: number): number[] => {
    const window = 5;
    let start = Math.max(1, current - Math.floor(window / 2));
    const end = Math.min(total, start + window - 1);
    start = Math.max(1, end - window + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  useEffect(() => {
    setPriceMinInput(priceMin || "");
    setPriceMaxInput(priceMax || "");
  }, [priceMin, priceMax]);

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceMinInput) params.set("priceMin", priceMinInput);
    else params.delete("priceMin");
    if (priceMaxInput) params.set("priceMax", priceMaxInput);
    else params.delete("priceMax");
    router.push(`?${params.toString()}`, { scroll: false });
    setShowFilters(false);
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <p className="text-2xl font-black uppercase tracking-tighter italic text-slate-300">
          No se pudieron cargar los productos
        </p>
        <button
          onClick={() => fetchProducts(1)}
          className="text-xs font-black uppercase tracking-widest text-[#0055a4] hover:text-[#003d7a] underline underline-offset-4 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );

  return (
    <div className="w-full max-w-[1440px] py-8 mx-auto px-4 md:px-8">

      {/* ── Header row ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-sky-900 uppercase tracking-tighter italic leading-none">
            Tienda Principal
          </h1>
          {!loading && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {totalCount} {totalCount === 1 ? "producto" : "productos"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-9 h-9 flex items-center justify-center transition-colors ${
                viewMode === "grid" ? "bg-sky-600 text-white" : "bg-white text-slate-400 hover:text-sky-600"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-9 h-9 flex items-center justify-center border-l border-slate-200 transition-colors ${
                viewMode === "list" ? "bg-sky-600 text-white" : "bg-white text-slate-400 hover:text-sky-600"
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Sort dropdown */}
          {showSort && (
            <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
          )}
          <div className="relative">
            <button
              onClick={() => setShowSort(o => !o)}
              className={`flex items-center gap-2 h-9 px-3 border rounded-xl text-xs font-bold transition-all ${
                showSort
                  ? "border-sky-400 text-sky-700 bg-sky-50"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
              }`}
            >
              <ArrowUpDown size={13} className="text-sky-500" />
              <span className="hidden sm:inline">{currentSortLabel}</span>
              <ChevronDown size={12} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setParam("sort", opt.value); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                      currentSort === opt.value
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(o => !o)}
            className={`flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-bold transition-all ${
              showFilters || activeFilters.length > 0
                ? "bg-sky-600 border-sky-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Filtros</span>
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 bg-white text-sky-600 rounded-full text-[9px] font-black flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Active filter chips ───────────────────────────────────────────── */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {activeFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setParam(f.key, null)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
            >
              {f.label}
              <X size={10} />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="h-7 px-3 rounded-full text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">

            {/* Brand */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marca</label>
              <select
                value={brand || ""}
                onChange={e => setParam("brand", e.target.value || null)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">Todas las marcas</option>
                {BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</label>
              <select
                value={category || ""}
                onChange={e => setParam("category", e.target.value || null)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {Array.isArray(categories) && categories.map((cat: CategoryType) => (
                  <option key={cat.id} value={cat.categoryName}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Precio</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceMinInput}
                  onChange={e => setPriceMinInput(e.target.value)}
                  className="w-24 h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-400"
                />
                <span className="text-slate-300 font-bold">—</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceMaxInput}
                  onChange={e => setPriceMaxInput(e.target.value)}
                  className="w-24 h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-400"
                />
                <button
                  onClick={applyPriceFilter}
                  className="h-9 px-4 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Clear */}
            {activeFilters.length > 0 && (
              <button
                onClick={() => { clearAll(); setShowFilters(false); }}
                className="h-9 px-3 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors self-end"
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>
      )}

      <Separator className="my-4 bg-sky-100" />

      {/* ── Products ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col">
        {/* Empty state */}
        {!loading && result.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-2xl font-black uppercase tracking-tighter italic text-slate-300">
              No se encontraron productos
            </p>
            <button
              onClick={clearAll}
              className="text-xs font-black uppercase tracking-widest text-[#0055a4] hover:text-[#003d7a] underline underline-offset-4 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-5 md:gap-6">
            {loading && <SkeletonSchema grid={16} />}
            {!loading && result.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <div className="flex flex-col gap-2">
            {loading && <SkeletonSchema grid={6} />}
            {!loading && result.map(product => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-10">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers(page, totalPages).map(p => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-9 h-9 flex items-center justify-center text-sm font-bold transition-all ${
                  page === p
                    ? "bg-sky-600 text-white border border-sky-600"
                    : "border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1440px] py-8 mx-auto px-4 md:px-8">
          <SkeletonSchema grid={16} />
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
