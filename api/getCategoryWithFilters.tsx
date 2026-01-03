import { useEffect, useState } from "react";

export function useGetCategoryWithFilters(slug?: string) {
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const url =
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories` +
      `?filters[slug][$eq]=${slug}` +
      `&populate[filters]=*`;

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
