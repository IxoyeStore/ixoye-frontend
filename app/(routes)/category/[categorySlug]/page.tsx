"use client"

import { Separator } from "@/components/ui/separator"
import { useParams } from "next/navigation"
import { useGetCategoryProduct } from "@/api/getCategoryProduct"
import FiltersControlCategory from "./components/filters-controls-category"
import SkeletonSchema from "@/components/skeletonSchema"
import ProductCard from "@/app/(routes)/category/[categorySlug]/components/product-card"
import { ProductType } from "@/types/product"
import { useState } from "react"

export default function Page() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const { result, loading, error } = useGetCategoryProduct(categorySlug)
  const [filterOrigin, setFilterOrigin] = useState('')

  const filteredProducts = result !== null && !loading && (
    filterOrigin == '' 
      ? result 
      : result.filter((product: ProductType) => 
          product.origin == filterOrigin
        )
  )

  if (loading) return <p>Cargando...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="max-w-6xl py-4 mx-auto sm:py-16 sm:px-24">
      {result.length > 0 && (
        <h1 className="text-3xl font-medium">
          Filtración
          {result[0]?.attributes?.category?.data?.attributes?.categoryName}
        </h1>
      )}
      <Separator />

      <div className="sm:flex sm:justify-between">
        <FiltersControlCategory setFilterOrigin={setFilterOrigin} filterOrigin={filterOrigin}/>

        <div className="grid w-full gap-5 mt-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
          {loading && <SkeletonSchema grid={3} />}

          {filteredProducts && filterOrigin !== '' && filteredProducts.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground mt-15">
              No se encontraron resultados
            </p>
          )}

          {filteredProducts && filteredProducts.length > 0 && (
            filteredProducts.map((product: ProductType) =>
              <ProductCard key={product.id} product={product} />
            )
          )}
        </div>
      </div>
    </div>
  )
}
