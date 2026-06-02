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
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

type StoredEntry = RecentProduct & { savedAt: number };

function loadFromStorage(): RecentProduct[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const entries: StoredEntry[] = JSON.parse(raw);
    const now = Date.now();
    return entries.filter((e) => now - e.savedAt < TTL_MS);
  } catch {
    return [];
  }
}

function saveToStorage(products: RecentProduct[]) {
  try {
    const now = Date.now();
    const entries: StoredEntry[] = products.map((p) => ({
      ...p,
      savedAt: (p as any).savedAt ?? now,
    }));
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {}
}

export function useRecentlyViewed() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const valid = loadFromStorage();
    setProducts(valid);
    setHydrated(true);
  }, []);

  const addProduct = useCallback((product: RecentProduct) => {
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX);
      // Assign fresh savedAt to the newly viewed product
      const withTimestamp = next.map((p) =>
        p.id === product.id ? { ...p, savedAt: Date.now() } : p
      );
      saveToStorage(withTimestamp as any);
      return next;
    });
  }, []);

  return { products, addProduct, hydrated };
}
