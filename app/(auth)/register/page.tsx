"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { RequiredLabel } from "@/components/required-label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/register-schema";
import { z } from "zod";
import { useRouter } from "next/navigation";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setRegisterError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.username,
            email: data.email,
            password: data.password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setRegisterError(
          result.error?.message || "El usuario o correo ya existe"
        );
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error(error);
      setRegisterError("Ocurrió un error al registrar");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg m-20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <RequiredLabel>Usuario</RequiredLabel>
            <Input placeholder="ej: juan_perez" {...register("username")} />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel>Correo electrónico</RequiredLabel>
            <Input
              type="email"
              placeholder="ej: correo@ejemplo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel>Contraseña</RequiredLabel>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel>Confirmar contraseña</RequiredLabel>
            <Input
              type="password"
              placeholder="Repite tu contraseña"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {registerError && (
            <p className="text-sm text-red-500 text-center">{registerError}</p>
          )}

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-primary">
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
