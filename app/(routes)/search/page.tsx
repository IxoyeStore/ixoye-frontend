/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductType } from "@/types/product";
import ProductCard from "../category/[categorySlug]/components/product-card";
import {
  X,
  Search,
  Target,
  ChevronRight,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductSort from "@/components/product-sort";
import SearchSkeleton from "@/components/searchSkeleton";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const isQueryTooShort = query.trim().length > 0 && query.trim().length < 2;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query || query.trim().length < 2) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const cleanQuery = query.trim();
        const keywords = cleanQuery
          .split(/\s+/)
          .filter((word) => word.length > 2);
        const params = new URLSearchParams();
        let i = 0;
        params.append(
          `filters[$or][${i}][productName][$containsi]`,
          cleanQuery,
        );
        i++;
        keywords.forEach((word) => {
          params.append(`filters[$or][${i}][productName][$containsi]`, word);
          i++;
        });
        keywords.forEach((word) => {
          ["code", "brand", "productType"].forEach((field) => {
            params.append(`filters[$or][${i}][${field}][$containsi]`, word);
            i++;
          });
        });
        params.append("populate", "category");
        params.append("pagination[pageSize]", "60");

        const response = await fetch(
          `https://ixoye-backend-production.up.railway.app/api/products?${params.toString()}`,
        );
        const json = await response.json();

        if (json.data) {
          const normalizedData = json.data.map((item: any) => ({
            id: item.id,
            ...item,
            productName: item.productName || "PRODUCTO SIN ESPECIFICAR",
          }));
          const rankedProducts = normalizedData.sort((a: any, b: any) => {
            const nameA = a.productName.toLowerCase();
            const nameB = b.productName.toLowerCase();
            const q = cleanQuery.toLowerCase();
            const aExact = nameA.includes(q) ? 100 : 0;
            const bExact = nameB.includes(q) ? 100 : 0;
            return bExact - aExact;
          });
          setProducts(rankedProducts);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query]);

  const availableBrands = useMemo(() => {
    const brands = products.map((p) => p.brand).filter(Boolean);
    return Array.from(new Set(brands)).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedBrands.length === 0) return products;
    return products.filter((p) => p.brand && selectedBrands.includes(p.brand));
  }, [products, selectedBrands]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-12 min-h-[70vh] bg-white">
      {loading ? (
        <SearchSkeleton />
      ) : isQueryTooShort ? (
        <div className="flex flex-col items-center justify-center py-24 border border-slate-100 rounded-xl bg-slate-50/30">
          <Target size={32} className="text-slate-900 mb-6 stroke-[1.5]" />
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">
            Criterio de búsqueda insuficiente
          </h2>
          <p className="text-slate-500 text-sm mb-10 max-w-sm text-center font-medium">
            Ingrese al menos dos caracteres para realizar una consulta técnica.
          </p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-12">
          {products.length > 0 && (
            <aside className="w-full md:w-64 shrink-0">
              <div className="md:sticky md:top-32">
                {/* Botón de control para móviles */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex md:hidden items-center justify-between w-full p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-sky-700" />
                    <span className="text-xs font-black uppercase italic text-slate-900">
                      Filtros de Marca
                    </span>
                    {selectedBrands.length > 0 && (
                      <span className="bg-sky-700 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                        {selectedBrands.length}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-slate-400 transition-transform ${showMobileFilters ? "rotate-90" : ""}`}
                  />
                </button>

                <div
                  className={`${showMobileFilters ? "block" : "hidden"} md:block animate-in fade-in slide-in-from-top-4 duration-300`}
                >
                  <div className="flex items-center justify-between mb-6 px-2 md:px-0">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">
                      Especificaciones
                    </h3>
                    {selectedBrands.length > 0 && (
                      <button
                        onClick={() => setSelectedBrands([])}
                        className="text-[10px] font-bold text-blue-600 uppercase border-b border-blue-600 pb-0.5"
                      >
                        Reiniciar
                      </button>
                    )}
                  </div>
                  <div className="space-y-6 bg-white md:bg-transparent p-4 md:p-0 border md:border-0 border-slate-100 rounded-xl">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                        Fabricante / Marca
                      </h4>
                      <div className="flex flex-col gap-3 max-h-64 md:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {availableBrands.map((brand) => (
                          <label
                            key={brand}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() =>
                                setSelectedBrands((prev) =>
                                  prev.includes(brand)
                                    ? prev.filter((b) => b !== brand)
                                    : [...prev, brand],
                                )
                              }
                              className="peer appearance-none w-4 h-4 border border-slate-300 rounded-sm checked:bg-slate-900 transition-all"
                            />
                            <span
                              className={`text-xs font-bold uppercase transition-colors ${selectedBrands.includes(brand) ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`}
                            >
                              {brand}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          <main className="flex-1">
            <div className="flex flex-col gap-6 mb-10 border-b border-slate-100 pb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                {/* Titulo y boton Limpiar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      Resultados de Catálogo
                    </span>
                    <button
                      onClick={() => router.push("/category")}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-red-600 text-slate-500 hover:text-white rounded-md transition-all duration-200 shadow-sm"
                    >
                      <X size={10} strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase">
                        Limpiar búsqueda
                      </span>
                    </button>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic leading-none truncate">
                    {query}
                  </h2>
                </div>

                {/* Contador y Ordenamiento */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right md:border-r md:border-slate-100 md:pr-8">
                    <span className="block text-xl md:text-2xl font-light text-slate-400 leading-none">
                      {filteredProducts.length}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Productos encontrados
                    </span>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-left md:text-right">
                      Ordenar por
                    </span>
                    <ProductSort />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Search
                    size={40}
                    className="mx-auto text-slate-200 mb-6 stroke-[1]"
                  />
                  <p className="text-slate-900 font-bold uppercase tracking-tight text-lg">
                    No se encontraron coincidencias
                  </p>
                  <Button
                    onClick={() => router.push("/category")}
                    className="mt-8 bg-sky-700 text-white px-8 py-6 font-bold rounded-xl uppercase text-xs tracking-widest"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Ver todo el catálogo
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
