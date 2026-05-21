/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import SkeletonSchema from "@/components/skeletonSchema";
import { ProductType } from "@/types/product";
import { useEffect, useState } from "react";
import ProductCard from "./[categorySlug]/components/product-card";
import { Button } from "@/components/ui/button";
import ProductSort from "@/components/product-sort";
import { useSearchParams } from "next/navigation";

function CategoryContent() {
  const [result, setResult] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "createdAt:desc";
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const series = searchParams.get("series");
  const productName = searchParams.get("productName");

  const fetchProducts = async (
    pageNumber: number,
    isNewLoad: boolean = false,
  ) => {
    try {
      if (isNewLoad) setLoading(true);
      else setLoadingMore(true);

      const pageSize = 16;

      let filterQuery = "";
      if (category)
        filterQuery += `&filters[productType][$containsi]=${category}`;
      if (brand) filterQuery += `&filters[brand][$containsi]=${brand}`;
      if (series) filterQuery += `&filters[series][$containsi]=${series}`;
      if (productName)
        filterQuery += `&filters[productName][$containsi]=${productName}`;

      const res = await fetch(
        `https://ixoye-backend-production.up.railway.app/api/products?pagination[page]=${pageNumber}&pagination[pageSize]=${pageSize}&sort[0]=${currentSort}${filterQuery}`,
      );
      const json = await res.json();

      if (isNewLoad) {
        setResult(json.data ?? []);
      } else {
        setResult((prev) => [...prev, ...(json.data ?? [])]);
      }

      setTotalPages(json.meta.pagination.pageCount);
    } catch {
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [currentSort, category, brand, series, productName]);

  const loadMore = () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <p className="text-2xl font-black uppercase tracking-tighter italic text-slate-300">
          No se pudieron cargar los productos
        </p>
        <button
          onClick={() => fetchProducts(1, true)}
          className="text-xs font-black uppercase tracking-widest text-[#0055a4] hover:text-[#003d7a] underline underline-offset-4 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );

  return (
    <div className="w-full max-w-[1440px] py-4 mx-auto sm:py-16 px-4 md:px-8">
      <div className="flex flex-col items-center gap-6 mb-8 w-full">
        <div className="text-center space-y-2 w-full max-w-2xl px-4">
          <h1 className="text-3xl sm:text-5xl font-black text-sky-900 uppercase tracking-tighter italic leading-none">
            Tienda Principal
          </h1>

          {(category || brand || series) && (
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] w-8 bg-sky-200" />
              <p className="text-[10px] font-bold text-sky-500 uppercase italic tracking-[0.2em]">
                Filtrando por:{" "}
                <span className="text-sky-700 underline decoration-sky-300 underline-offset-4">
                  {category || brand || series}
                </span>
              </p>
              <span className="h-[1px] w-8 bg-sky-200" />
            </div>
          )}
        </div>

        <div className="w-full flex justify-center md:justify-end md:absolute md:right-8 lg:right-12">
          <div className="relative z-10">
            <ProductSort />
          </div>
        </div>
      </div>

      <Separator className="my-4 bg-sky-100" />

      <div className="flex flex-col">
        <div className="grid w-full grid-cols-2 gap-4 mt-8 lg:grid-cols-4 md:gap-6">
          {loading && <SkeletonSchema grid={16} />}
          {!loading && result.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center">
              <p className="text-2xl font-black uppercase tracking-tighter italic text-slate-300">
                No se encontraron productos
              </p>
              <Button
                variant="link"
                onClick={() => (window.location.href = "/category")}
                className="text-xs font-black uppercase tracking-widest text-[#0055a4] hover:text-[#003d7a]"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
          {!loading &&
            result.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>

        {!loading && page < totalPages && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-sky-700 hover:bg-sky-800 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              {loadingMore ? "Cargando..." : "Mostrar más productos"}
            </Button>
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
        <div className="w-full max-w-[1440px] py-4 mx-auto sm:py-16 px-4 md:px-8">
          <SkeletonSchema grid={16} />
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
