"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const code = searchParams.get("code");

  useEffect(() => {
    const confirmAccount = async () => {
      if (!code) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(
          `https://ixoye-backend-production.up.railway.app/api/auth/email-confirmation?confirmation=${code}`,
        );

        if (res.ok) {
          setStatus("success");
          setTimeout(() => {
            router.push("/login?confirmed=true");
          }, 4000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error confirmando cuenta:", error);
        setStatus("error");
      }
    };

    confirmAccount();
  }, [code, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#0071b1] mx-auto" />
            <h1 className="text-xl font-bold text-[#012849]">
              Verificando tu cuenta...
            </h1>
            <p className="text-gray-500 text-sm">
              Estamos validando tu correo con nuestro servidor.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-black text-[#012849]">
              ¡Correo verificado!
            </h1>
            <p className="text-gray-600">
              Tu cuenta ha sido activada correctamente. En unos segundos serás
              redirigido al inicio de sesión.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-block bg-[#0071b1] hover:bg-[#012849] text-white px-8 py-3 rounded-lg font-bold transition-colors"
              >
                Ir al Login ahora
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-black text-[#012849]">
              Enlace inválido
            </h1>
            <p className="text-gray-600">
              El código de confirmación es incorrecto, ha expirado o ya fue
              utilizado anteriormente.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="text-[#0071b1] font-bold hover:underline"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#0071b1]" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
