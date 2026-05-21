"use client";
import { useEffect } from "react";

export default function TrackView({ productId }: { productId: number }) {
  useEffect(() => {
    fetch("/api/metrics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, event: "view" }),
    }).catch(() => {});
  }, [productId]);

  return null;
}
