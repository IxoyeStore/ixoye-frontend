/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductType } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "../category/[categorySlug]/components/product-card";
import { Search, Target, ChevronRight } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const isQueryTooShort = query.trim().length > 0 && query.trim().length < 2;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query || query.trim().length < 2) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSelectedBrands([]);

      try {
        const keywords = query.trim().split(/\s+/);

        const searchFields = [
          "productName",
          "code",
          "brand",
          "series",
          "productType",
          "department",
        ];

        const params = new URLSearchParams();

        let globalIndex = 0;
        keywords.forEach((word) => {
          searchFields.forEach((field) => {
            params.append(
              `filters[$or][${globalIndex}][${field}][$containsi]`,
              word,
            );
            globalIndex++;
          });
        });

        params.append("populate", "category");

        const url = `https://ixoye-backend-production.up.railway.app/api/products?${params.toString()}`;
        const response = await fetch(url);
        const json = await response.json();

        if (json.data) {
          const normalizedData = json.data.map((item: any) => ({
            id: item.id,
            ...item,
            productName: item.productName || "PRODUCTO SIN ESPECIFICAR",
            price: Number(item.price || 0),
            brand: item.brand || "N/A",
            images: item.images || { data: [] },
          }));
          setProducts(normalizedData);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
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
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[70vh] bg-white">
      <div className="flex flex-col md:flex-row gap-12">
        {!isQueryTooShort && query.length >= 2 && (
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-6">
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
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Fabricante / Marca
                  </h4>
                  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {availableBrands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
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
                            className="peer appearance-none w-4 h-4 border border-slate-300 rounded-sm checked:bg-slate-900 checked:border-slate-900 transition-all"
                          />
                          <ChevronRight
                            size={10}
                            className="absolute text-white left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity"
                          />
                        </div>
                        <span
                          className={`text-xs font-bold uppercase tracking-tight transition-colors ${selectedBrands.includes(brand) ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`}
                        >
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1">
          {isQueryTooShort ? (
            <div className="flex flex-col items-center justify-center py-24 border border-slate-100 rounded-xl bg-slate-50/30">
              <Target size={32} className="text-slate-900 mb-6 stroke-[1.5]" />
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">
                Criterio de búsqueda insuficiente
              </h2>
              <p className="text-slate-500 text-sm mb-10 max-w-sm text-center font-medium">
                Ingrese al menos dos caracteres para realizar una consulta
                técnica en el catálogo de componentes.
              </p>

              <div className="w-full max-w-md">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
                  Consultas frecuentes
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {["BALERO", "EM120", "FORD", "CLUTCH"].map((term) => (
                    <button
                      key={term}
                      onClick={() => router.push(`/search?query=${term}`)}
                      className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3 rounded-lg text-[11px] font-bold text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 group"
                    >
                      {term}
                      <ChevronRight
                        size={14}
                        className="text-slate-300 group-hover:text-white"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between mb-10 border-b border-slate-100 pb-6">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    Resultados de Catálogo
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none mt-1">
                    {query}
                  </h2>
                </div>
                {!loading && (
                  <div className="text-right">
                    <span className="block text-2xl font-light text-slate-300 leading-none">
                      {filteredProducts.length}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Productos encontrados
                    </span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-96 w-full rounded-none" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-32">
                      <Search
                        size={40}
                        className="mx-auto text-slate-200 mb-6 stroke-[1]"
                      />
                      <p className="text-slate-900 font-bold uppercase tracking-tight text-lg">
                        No se encontraron coincidencias
                      </p>
                      <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-medium">
                        Verifique el código OEM o la descripción técnica
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
