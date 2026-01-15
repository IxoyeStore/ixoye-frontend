"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessErrorHandler() {
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

export default function SuccessErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
          <p className="text-sky-700 font-medium animate-pulse">
            Procesando tu solicitud...
          </p>
        </div>
      }
    >
      <SuccessErrorHandler />
    </Suspense>
  );
}
