import { useEffect, useState } from "react";

export function useGetCategoryWithFilters(slug?: string) {
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const url =
      `https://ixoye-backend-production.up.railway.app/api/categories` +
      `?filters[slug][$eq]=${slug}` +
      `&populate=products`;

    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(url);
      const json = await res.json();
      setCategory(json.data?.[0] ?? null);
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  return { category, loading };
}
