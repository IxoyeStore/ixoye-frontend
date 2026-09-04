import { useEffect, useState } from "react";

export function useGetNewestProducts() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/products?filters[active][$eq]=true&sort[0]=createdAt:desc&pagination[pageSize]=12&`;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        setResult(json.data);
        setLoading(false);
      } catch (error: any) {
        setError(error);
        setLoading(false);
      }
    })();
  }, [url]);

  return { loading, result, error };
}
