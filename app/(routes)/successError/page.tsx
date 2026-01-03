"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessErrorPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const status = params.get("status");

    if (status === "success") {
      router.replace("/success");
    } else {
      router.replace("/cart");
    }
  }, [router, params]);

  return null;
}
