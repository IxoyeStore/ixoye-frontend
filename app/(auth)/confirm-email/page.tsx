"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthLogo from "@/components/auth-logo";

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
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/email-confirmation?confirmation=${code}`,
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
    <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-gray-100 dark:ring-slate-700 animate-in fade-in duration-500">
      <CardHeader className="space-y-1 text-center pt-8 pb-4">
        <div className="flex justify-center mb-3">
          <AuthLogo />
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-10 text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#0071b1] mx-auto" />
            <CardTitle className="text-xl font-bold text-[#012849] dark:text-sky-300">
              Verificando tu cuenta...
            </CardTitle>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Estamos validando tu correo con nuestro servidor.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <CardTitle className="text-2xl font-black text-[#012849] dark:text-sky-300">
              ¡Correo verificado!
            </CardTitle>
            <p className="text-gray-600 dark:text-slate-400">
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
            <CardTitle className="text-2xl font-black text-[#012849] dark:text-sky-300">
              Enlace inválido
            </CardTitle>
            <p className="text-gray-600 dark:text-slate-400">
              El código de confirmación es incorrecto, ha expirado o ya fue
              utilizado anteriormente.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="text-[#0071b1] dark:text-sky-400 font-bold hover:underline"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0071b1] border-t-transparent mb-4"></div>
          <p className="text-sm font-semibold text-[#012849] dark:text-sky-300 animate-pulse">
            Cargando...
          </p>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
