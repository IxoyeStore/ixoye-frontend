"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Contraseña mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, refreshUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  if (!mounted) return <div>Cargando...</div>;

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

      if (!res.ok) {
        const text = await res.text();
        const result = text ? JSON.parse(text) : null;
        setLoginError(result?.error || "Correo o contraseña incorrectos");
        return;
      }

      const result = await res.json();

      if (result.user) {
        setUser(result.user);
      } else {
        await refreshUser();
      }

      router.push("/profile");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Error al iniciar sesión");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ingresa tus datos para acceder a tu cuenta
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Correo electrónico</label>
            <Input
              type="email"
              {...register("email")}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              type="password"
              {...register("password")}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {loginError && (
            <p className="text-sm text-red-500 text-center">{loginError}</p>
          )}

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <a href="/register" className="font-medium text-primary">
            Crear cuenta
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
