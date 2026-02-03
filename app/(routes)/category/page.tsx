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

      const pageSize = 24;

      let filterQuery = "";
      if (category)
        filterQuery += `&filters[productType][$containsi]=${category}`;
      if (brand) filterQuery += `&filters[brand][$containsi]=${brand}`;
      if (series) filterQuery += `&filters[series][$containsi]=${series}`;
      if (productName)
        filterQuery += `&filters[productName][$containsi]=${productName}`;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?populate=*&pagination[page]=${pageNumber}&pagination[pageSize]=${pageSize}&sort[0]=${currentSort}${filterQuery}`,
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

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 px-4 sm:px-24">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-sky-900 uppercase tracking-tighter truncate">
            Tienda
          </h1>
          {(category || brand || series) && (
            <p className="text-[10px] font-bold text-sky-500 uppercase italic">
              Filtrando por: {category || brand || series}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <ProductSort />
        </div>
      </div>

      <Separator className="my-4 bg-sky-100" />

      <div className="flex flex-col">
        <div className="grid w-full grid-cols-2 gap-3 mt-8 md:grid-cols-3 md:gap-10">
          {loading && <SkeletonSchema grid={6} />}

          {!loading && result.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-sky-800/60 font-black uppercase italic tracking-widest">
                No se encontraron productos
              </p>
              <Button
                variant="link"
                onClick={() => (window.location.href = "/category")}
                className="text-sky-500 text-xs uppercase font-bold mt-2"
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
        <div className="max-w-6xl py-4 mx-auto sm:py-16 px-4 sm:px-24">
          <SkeletonSchema grid={6} />
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
