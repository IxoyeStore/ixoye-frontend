"use client";

import { Separator } from "@/components/ui/separator";
import SkeletonSchema from "@/components/skeletonSchema";
import { ProductType } from "@/types/product";
import { useEffect, useState } from "react";
import ProductCard from "./[categorySlug]/components/product-card";

export default function Page() {
  const [result, setResult] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOrigin, setFilterOrigin] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?populate=*`
        );
        const json = await res.json();
        setResult(json.data ?? []);
      } catch {
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    filterOrigin === ""
      ? result
      : result.filter((product) => product.origin === filterOrigin);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      <h1 className="text-3xl font-bold text-sky-900">Tienda</h1>

      <Separator className="my-4 bg-sky-100" />

      <div className="sm:flex sm:justify-between">
        {/* Filtros
        <div>
          <FiltersControlCategory
            setFilterOrigin={setFilterOrigin}
            filterOrigin={filterOrigin}
          />

          {filterOrigin !== "" && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-sky-600 hover:text-sky-800 hover:bg-sky-50"
              onClick={() => setFilterOrigin("")}
            >
              Quitar filtro
            </Button>
          )}
        </div> */}

        {/* Grid */}
        <div className="grid w-full gap-5 mt-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
          {loading && <SkeletonSchema grid={6} />}

          {!loading && filteredProducts.length === 0 && (
            <p className="col-span-full text-center text-sky-800/60 mt-10 font-medium">
              No se encontraron productos
            </p>
          )}

          {!loading &&
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>
    </div>
  );
}
