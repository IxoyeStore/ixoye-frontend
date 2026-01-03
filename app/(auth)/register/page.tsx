"use client";

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

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/custom-register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.email,
            email: data.email,
            password: data.password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || "Error al registrarse");
      }

      console.log("REGISTER OK:", result);
      const userId = result.user?.id;
      const jwt = result.jwt;

      if (userId && jwt) {
        const updateRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              motherLastName: data.motherLastName,
              phone: data.phone,
              birthDate: data.birthDate,
            }),
          }
        );

        const updatedUser = await updateRes.json();

        if (!updateRes.ok) {
          throw new Error(
            updatedUser.error?.message || "Error al actualizar perfil"
          );
        }

        console.log("PROFILE UPDATED:", updatedUser);
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-lg m-20">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre y Apellidos */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <RequiredLabel>Nombre(s)</RequiredLabel>
              <Input placeholder="Juan" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <RequiredLabel>Apellido paterno</RequiredLabel>
              <Input placeholder="Pérez" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">Apellido materno</label>
              <Input placeholder="Gómez" {...register("motherLastName")} />
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className="space-y-1">
            <RequiredLabel>Fecha de nacimiento</RequiredLabel>
            <Input type="date" {...register("birthDate")} />
            {errors.birthDate && (
              <p className="text-sm text-red-500">{errors.birthDate.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <RequiredLabel>Número de teléfono</RequiredLabel>
            <Input
              type="tel"
              placeholder="55 1234 5678"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <RequiredLabel>Correo electrónico</RequiredLabel>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <RequiredLabel>Contraseña</RequiredLabel>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <RequiredLabel>Confirmar contraseña</RequiredLabel>
            <Input type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Register button */}
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        <Separator />

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
