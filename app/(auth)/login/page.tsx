"use client";

import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Contraseña mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, refreshUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoginError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setLoginError(result.error || "Credenciales inválidas");
        return;
      }

      if (result.user) setUser(result.user);
      await refreshUser();
      window.location.href = callbackUrl || "/profile";
    } catch (error) {
      setLoginError("Error al iniciar sesión");
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0071b1] border-t-transparent mb-4"></div>
        <p className="text-sm font-semibold text-[#012849] animate-pulse">
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-gray-100 animate-in fade-in duration-500">
      <CardHeader className="space-y-1 text-center pt-8 pb-4">
        <CardTitle className="text-3xl font-extrabold text-[#012849] tracking-tight">
          Iniciar sesión
        </CardTitle>
        <p className="text-sm text-gray-500">
          Usa tu cuenta Refacciones Diésel y Agrícola Ixoye
        </p>
      </CardHeader>

      <CardContent className="space-y-6 px-8 pb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-2">
            <div className="text-sm font-bold text-[#012849]">
              Correo electrónico
            </div>
            <Input
              type="email"
              {...register("email")}
              placeholder="correo@ejemplo.com"
              className="border-gray-200 focus-visible:ring-[#0071b1] h-11 bg-gray-50/30"
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-[#012849]">Contraseña</div>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#0071b1] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="border-gray-200 focus-visible:ring-[#0071b1] h-11 bg-gray-50/30"
            />
            {errors.password && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {loginError && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100 text-center font-medium">
              {loginError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#0071b1] hover:bg-[#012849] text-white h-12 text-base font-bold mt-2 shadow-lg transition-all active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Accediendo..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">
              O también
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="font-bold text-[#0071b1] hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
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
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
