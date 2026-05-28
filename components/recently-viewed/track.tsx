"use client";
import { useEffect } from "react";
import { useRecentlyViewed, type RecentProduct } from "@/hooks/use-recently-viewed";

export default function TrackRecentlyViewed({ product }: { product: RecentProduct }) {
  const { addProduct } = useRecentlyViewed();
  useEffect(() => {
    addProduct(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}
