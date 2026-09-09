/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import SkeletonSchema from "@/components/skeletonSchema";
import { ProductType } from "@/types/product";
import { CategoryType } from "@/types/category";
import { useEffect, useState } from "react";
import ProductCard from "./[categorySlug]/components/product-card";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, LayoutGrid, List, ShoppingCart, Heart } from "lucide-react";
import { VEHICLE_TYPES } from "@/constants/vehicle-types";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import Link from "next/link";
import Image from "next/image";

const BRANDS = [
  "EMMARK","WEGA","BALDWIN","SAKURA","PFI","FERSA","DAI","EDTPART","GABRIEL",
  "KANADIAN","ZSG","RYCO","KOMAN",
  "BEZARES","TOYOPOWER",
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
  const { lovedItems, addLovedItem, removeLovedItem } = useLovedProducts();
  const isLoved = lovedItems.some((item) => item.id === product.id);

  return (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-800 hover:shadow-sm transition-all rounded-xl">
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border border-slate-100 dark:border-slate-600">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.productName}
              fill
              draggable={false}
              className="object-contain"
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
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded shrink-0">
              {product.code}
            </span>
          )}
          {product.brand && (
            <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-1.5 py-0.5 rounded shrink-0">
              {product.brand}
            </span>
          )}
        </div>
        <Link href={`/product/${product.slug}`}>
          <p className="text-sm font-bold text-sky-900 dark:text-sky-300 line-clamp-2 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
            {product.productName}
          </p>
        </Link>
        {product.productType && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{product.productType}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="font-bold text-green-600 dark:text-green-400 text-base">{formatPrice(product.price)}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors"
          >
            <ShoppingCart size={13} />
            Agregar
          </button>
          <button
            onClick={() => isLoved ? removeLovedItem(product.id) : addLovedItem(product)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
              isLoved
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-500 dark:text-red-400"
                : "border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-800 hover:text-red-400"
            }`}
          >
            <Heart size={14} strokeWidth={2.5} fill={isLoved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryContent({ title = "Tienda Principal" }: { title?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [result, setResult]           = useState<ProductType[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid");
  const [productTypeOptions, setProductTypeOptions] = useState<string[]>([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);

  const page         = parseInt(searchParams.get("page") || "1", 10) || 1;
  const currentSort  = searchParams.get("sort")        || "createdAt:desc";
  const category     = searchParams.get("category");
  const brand        = searchParams.get("brand");
  const vehicleType  = searchParams.get("vehicleType");
  const productType  = searchParams.get("productType");
  const series       = searchParams.get("series");
  const productName  = searchParams.get("productName");

  // Todas las categorias reales (no solo las destacadas del home), para que
  // el filtro sea exacto y no oculte categorias validas como FRENOS o ELECTRICO.
  const [categories, setCategories] = useState<CategoryType[]>([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories?sort=categoryName:asc`)
      .then(r => r.json())
      .then(json => setCategories(json.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  // El filtro de Tipo de Producto depende de la categoria elegida: cada vez
  // que cambia, se traen los tipoProducto reales que existen dentro de esa
  // categoria (mismo patron que technical-filter-modal.tsx).
  useEffect(() => {
    if (!category) {
      setProductTypeOptions([]);
      return;
    }
    let cancelled = false;
    setLoadingProductTypes(true);
    const params = new URLSearchParams();
    params.set("filters[category][categoryName][$eq]", category);
    params.set("filters[productType][$notNull]", "true");
    params.set("fields[0]", "productType");
    params.set("pagination[pageSize]", "100");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        const values = (json.data ?? []).map((p: any) => p.productType).filter(Boolean);
        setProductTypeOptions(Array.from(new Set(values)).sort() as string[]);
      })
      .catch(() => { if (!cancelled) setProductTypeOptions([]); })
      .finally(() => { if (!cancelled) setLoadingProductTypes(false); });
    return () => { cancelled = true; };
  }, [category]);

  // Cambiar un filtro siempre reinicia la paginacion a la pagina 1.
  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push(pathname, { scroll: false });

  // Cambiar de categoria invalida el tipo de producto elegido (depende de ella).
  const setCategory = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    params.delete("productType");
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const activeFilters = [
    brand       && { key: "brand",       label: `Marca: ${brand}` },
    vehicleType && { key: "vehicleType", label: `Vehículo: ${vehicleType}` },
    category    && { key: "category",    label: `Categoría: ${category}` },
    productType && { key: "productType", label: `Tipo: ${productType}` },
    series      && { key: "series",      label: `Serie: ${series}` },
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
      if (category)    params.set("filters[category][categoryName][$eq]", category);
      if (productType) params.set("filters[productType][$eq]", productType);
      if (vehicleType) params.set("filters[vehicleType][$eq]", vehicleType);
      if (brand)       params.set("filters[brand][$containsi]", brand);
      if (series)      params.set("filters[series][$containsi]", series);
      if (productName) params.set("filters[productName][$containsi]", productName);

      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`
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
    fetchProducts(page);
  }, [page, currentSort, category, productType, vehicleType, brand, series, productName]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const getPageNumbers = (current: number, total: number): number[] => {
    const window = 5;
    let start = Math.max(1, current - Math.floor(window / 2));
    const end = Math.min(total, start + window - 1);
    start = Math.max(1, end - window + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <p className="text-2xl font-black uppercase tracking-tighter italic text-slate-300 dark:text-slate-600">
          No se pudieron cargar los productos
        </p>
        <button
          onClick={() => fetchProducts(1)}
          className="text-xs font-black uppercase tracking-widest text-[#0055a4] dark:text-sky-400 hover:text-[#003d7a] dark:hover:text-sky-300 underline underline-offset-4 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );

  return (
    <div className="w-full max-w-[1440px] py-8 mx-auto px-4 md:px-8">

      {/* ── Header row ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-sky-900 dark:text-sky-300 uppercase tracking-tighter italic leading-none">
            {title}
          </h1>
          {!loading && (
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              {totalCount} {totalCount === 1 ? "producto" : "productos"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-9 h-9 flex items-center justify-center transition-colors ${
                viewMode === "grid" ? "bg-sky-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-9 h-9 flex items-center justify-center border-l border-slate-200 dark:border-slate-600 transition-colors ${
                viewMode === "list" ? "bg-sky-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400"
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Filters + Sort toggle */}
          <button
            onClick={() => setShowFilters(o => !o)}
            className={`flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-bold transition-all ${
              showFilters || activeFilters.length > 0
                ? "bg-sky-600 border-sky-600 text-white"
                : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-700 dark:hover:text-sky-400"
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
              onClick={() => f.key === "category" ? setCategory(null) : setParam(f.key, null)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-800 hover:text-red-500 transition-colors"
            >
              {f.label}
              <X size={10} />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="h-7 px-3 rounded-full text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
          <div className="flex flex-wrap items-end gap-3">

            {/* Sort */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ordenar por</label>
              <select
                value={currentSort}
                onChange={e => setParam("sort", e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-700 sm:hidden" />

            {/* Brand */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Marca</label>
              <select
                value={brand || ""}
                onChange={e => setParam("brand", e.target.value || null)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">Todas las marcas</option>
                {BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Vehicle type (segment) */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tipo de Vehículo</label>
              <select
                value={vehicleType || ""}
                onChange={e => setParam("vehicleType", e.target.value || null)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">Todos los vehículos</option>
                {VEHICLE_TYPES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Categoría</label>
              <select
                value={category || ""}
                onChange={e => setCategory(e.target.value || null)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {Array.isArray(categories) && categories.map((cat: CategoryType) => (
                  <option key={cat.id} value={cat.categoryName}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            {/* Product type (detail, depends on Category) */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tipo de Producto</label>
              <select
                value={productType || ""}
                onChange={e => setParam("productType", e.target.value || null)}
                disabled={!category || loadingProductTypes}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:border-sky-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!category
                    ? "Elige una categoría"
                    : loadingProductTypes
                      ? "Cargando..."
                      : "Todos los tipos"}
                </option>
                {productTypeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Clear */}
            {activeFilters.length > 0 && (
              <button
                onClick={() => { clearAll(); setShowFilters(false); }}
                className="h-9 px-3 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors self-end"
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>
      )}

      <Separator className="my-4 bg-sky-100 dark:bg-slate-700" />

      {/* ── Products ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col">
        {/* Empty state */}
        {!loading && result.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-2xl font-black uppercase tracking-tighter italic text-slate-300 dark:text-slate-600">
              No se encontraron productos
            </p>
            <button
              onClick={clearAll}
              className="text-xs font-black uppercase tracking-widest text-[#0055a4] dark:text-sky-400 hover:text-[#003d7a] dark:hover:text-sky-300 underline underline-offset-4 transition-colors"
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
              className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                    : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page({ title }: { title?: string }) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1440px] py-8 mx-auto px-4 md:px-8">
          <SkeletonSchema grid={16} />
        </div>
      }
    >
      <CategoryContent title={title} />
    </Suspense>
  );
}
