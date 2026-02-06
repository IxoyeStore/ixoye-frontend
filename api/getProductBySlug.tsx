import { useEffect, useState } from "react";
import { ProductType } from "@/types/product";

export function useGetProductBySlug(slug?: string) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const url = `https://ixoye-backend-production.up.railway.app/api/products?filters[slug][$eq]=${slug}&populate=images`;
    (async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        setProduct(json.data[0] ?? null);
      } catch (error) {
        setError("Error al obtener el producto");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return { product, loading, error };
}
