import { useState, useEffect } from "react";

export function useGetCategories() {
  const url =
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories` +
    `?filters[isFeatured][$eq]=true` +
    `&populate=mainImage`;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      console.log("URL:", url);

      const res = await fetch(url);
      const json = await res.json();

      console.log("Respuesta Strapi:", json);

      setResult(json.data ?? []);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { loading, result, error };
}
