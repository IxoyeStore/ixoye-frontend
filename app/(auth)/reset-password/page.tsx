"use client";

import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RequiredLabel } from "@/components/required-label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { registerSchema } from "@/schemas/register-schema";

const resetSchema = z
  .object({
    password: registerSchema.shape.password,
    confirmPassword: registerSchema.shape.confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const code = searchParams.get("code");

  useEffect(() => {
    setMounted(true);
    if (!code) {
      setStatus("error");
      setErrorMessage("El código de recuperación es inválido o ha expirado.");
    }
  }, [code]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code,
            password: data.password,
            passwordConfirmation: data.confirmPassword,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error?.message || "Error al restablecer la contraseña"
        );
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0071b1] border-t-transparent mb-4"></div>
        <p className="text-sm font-semibold text-[#012849] animate-pulse">
          Cargando...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-gray-100 animate-in zoom-in-95 duration-500">
        <CardContent className="px-8 py-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#012849]">
              ¡Contraseña actualizada!
            </h3>
            <p className="text-gray-500 text-sm">
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar
              sesión.
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-[#0071b1] hover:bg-[#005a8e] h-12 font-bold"
          >
            <Link href="/login">Ir al inicio de sesión</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-gray-100 animate-in fade-in duration-500">
      <CardHeader className="text-center pt-8 pb-4">
        <CardTitle className="text-2xl font-extrabold text-[#012849] tracking-tight">
          Nueva contraseña
        </CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          Crea una contraseña segura para tu cuenta.
        </p>
      </CardHeader>

      <CardContent className="px-8 pb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-[#012849]">
              <RequiredLabel>Nueva contraseña</RequiredLabel>
            </div>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
              className="border-gray-200 h-11 bg-gray-50/30"
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="text-sm font-bold text-[#012849]">
              <RequiredLabel>Confirmar nueva contraseña</RequiredLabel>
            </div>
            <Input
              type="password"
              placeholder="Repite tu nueva contraseña"
              {...register("confirmPassword")}
              className="border-gray-200 h-11 bg-gray-50/30"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#0071b1] hover:bg-[#005a8e] text-white h-12 text-base font-bold mt-2 transition-all active:scale-[0.98]"
            disabled={isSubmitting || !code}
          >
            {isSubmitting ? "Restableciendo..." : "Restablecer contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center p-4 py-12 min-h-[calc(100vh-80px)] bg-gray-50/50">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0071b1] border-t-transparent mb-4"></div>
            <p className="text-sm font-semibold text-[#012849] animate-pulse">
              Cargando...
            </p>
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
