"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        }
      );

      if (!res.ok) {
        throw new Error("No se pudo enviar el correo de recuperación.");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("Ocurrió un error. Verifica que el correo sea correcto.");
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50/50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0071b1] border-t-transparent mb-4"></div>
        <p className="text-sm font-semibold text-[#012849] animate-pulse">
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12 px-4 bg-gray-50/50 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-gray-100 animate-in fade-in duration-500">
        {!isSubmitted ? (
          <>
            <CardHeader className="text-center pt-8 pb-4">
              <CardTitle className="text-2xl font-extrabold text-[#012849] tracking-tight">
                ¿Olvidaste tu contraseña?
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2 px-4">
                Ingresa tu correo y te enviaremos instrucciones para
                restablecerla.
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-10 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-bold text-[#012849]">
                    Correo electrónico
                  </div>
                  <Input
                    type="email"
                    placeholder="ej: correo@ejemplo.com"
                    {...register("email")}
                    className="border-gray-200 h-11 bg-gray-50/30"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center font-medium">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#0071b1] hover:bg-[#005a8e] text-white h-12 text-base font-bold mt-2 transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Reestablecer contraseña"}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-semibold text-[#0071b1] hover:underline gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="px-8 py-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[#012849]">
                ¡Correo enviado!
              </h3>
              <p className="text-gray-500 text-sm">
                Hemos enviado un enlace de recuperación a tu bandeja de entrada.
                Si el correo coincide con un correo registrado, te enviaremos un
                enlace de recuperación de contraseña. Por favor, revisa también
                tu carpeta de spam.
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-[#0071b1] hover:bg-[#005a8e] text-white h-12 font-bold"
            >
              <Link href="/login">Regresar al login</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
