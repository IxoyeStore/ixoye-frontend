"use client";

import { useState, useEffect, useCallback } from "react";

export type RecentProduct = {
  id: number;
  slug: string;
  productName: string;
  code: string;
  image: string;
  price: number;
  wholesalePrice?: number | null;
};

const KEY = "ixoye_recently_viewed";
const MAX = 12;

export function useRecentlyViewed() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setProducts(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  const addProduct = useCallback((product: RecentProduct) => {
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { products, addProduct, hydrated };
}
