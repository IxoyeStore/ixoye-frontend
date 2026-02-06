import { useState, useEffect } from "react";

export function useGetCategories() {
  const url =
    `https://ixoye-backend-production.up.railway.app/api/categories` +
    `?filters[isFeatured][$eq]=true` +
    `&populate=mainImage`;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch(url);
      const json = await res.json();

      setResult(json.data ?? []);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { loading, result, error };
}
