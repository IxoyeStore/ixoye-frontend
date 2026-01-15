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
import { useAuth } from "@/context/auth-context";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
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

      const sessionRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt: result.jwt,
          user: result.user,
        }),
      });

      if (sessionRes.ok) {
        if (refreshUser) {
          await refreshUser();
        }
        router.push("/profile/edit");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      setRegisterError("Ocurrió un error al registrar");
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Crear cuenta
          </CardTitle>
          <p className="text-sm text-[#012849] mt-2">
            Únete a Refacciones Ixoye y gestiona tus pedidos
          </p>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#012849]">
                <RequiredLabel>Usuario</RequiredLabel>
              </div>

              <Input
                placeholder="ej: juan_perez"
                {...register("username")}
                className="border-gray-300 focus-visible:ring-[#0071b1] h-11"
              />
              {errors.username && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#012849]">
                <RequiredLabel>Correo electrónico</RequiredLabel>
              </div>
              <Input
                type="email"
                placeholder="ej: correo@ejemplo.com"
                {...register("email")}
                className="border-gray-300 focus-visible:ring-[#0071b1] h-11"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#012849]">
                <RequiredLabel>Contraseña</RequiredLabel>
              </div>

              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...register("password")}
                className="border-gray-300 focus-visible:ring-[#0071b1] h-11"
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#012849]">
                <RequiredLabel>Confirmar contraseña</RequiredLabel>
              </div>

              <Input
                type="password"
                placeholder="Repite tu contraseña"
                {...register("confirmPassword")}
                className="border-gray-300 focus-visible:ring-[#0071b1] h-11"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {registerError && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100 text-center font-medium">
                {registerError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#0071b1] hover:bg-[#005a8e] text-white transition-all h-12 text-base font-semibold mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">
                ¿Ya eres cliente?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-[#012849]">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-bold text-[#0071b1] hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
