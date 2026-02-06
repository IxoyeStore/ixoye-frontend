import { useEffect, useState } from "react";

export function useGetCategoryProduct(slug?: string) {
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const url =
      `https://ixoye-backend-production.up.railway.app/api/products` +
      `?populate=*` +
      `&filters[category][slug][$eq]=${slug}`;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Error HTTP");
        }

        const json = await res.json();
        setResult(json.data ?? []);
      } catch (err) {
        setError("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return { result, loading, error };
}
