"use client";

import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";

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

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  if (!mounted)
    return (
      <div className="flex justify-center p-10 font-medium text-gray-500">
        Cargando...
      </div>
    );

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

      if (result.user) {
        setUser(result.user);
      }

      await refreshUser();
      window.location.href = callbackUrl || "/profile";
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Error al iniciar sesión");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-none">
      <CardHeader className="space-y-1 text-center pt-8">
        <CardTitle className="text-3xl font-bold text-gray-900">
          Iniciar sesión
        </CardTitle>
        <p className="text-sm text-gray-500">
          Usa tu cuenta Refacciones Diésel y Agrícola Ixoye
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-8 pb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="correo@ejemplo.com"
              className="border-gray-300 focus-visible:ring-[#0071b1] h-11"
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <Input
              type="password"
              {...register("password")}
              placeholder="•••••••••••"
              className="border-gray-300 focus-visible:ring-[#0071b1] h-11"
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">
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
            className="w-full bg-[#0071b1] hover:bg-[#005a8e] text-white transition-all h-12 text-base font-semibold mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Accediendo..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">
              O también
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <a
            href="/register"
            className="font-bold text-[#0071b1] hover:underline"
          >
            Registrate aquí
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center p-4 py-12">
      <Suspense
        fallback={<div className="text-[#0071b1] font-bold">Cargando...</div>}
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
