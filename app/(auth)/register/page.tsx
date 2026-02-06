"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [mounted, setMounted] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [isLoadingLegal, setIsLoadingLegal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const openLegalModal = async (
    type: "terms-and-condition" | "privacy-policy",
  ) => {
    setIsModalOpen(true);
    setIsLoadingLegal(true);
    setModalContent("");
    setModalTitle(
      type === "terms-and-condition"
        ? "Términos y Condiciones"
        : "Aviso de Privacidad",
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${type}`);
      if (!res.ok) throw new Error("No encontrado");
      const result = await res.json();
      const rawData = result.data?.attributes?.content || result.data?.content;

      if (Array.isArray(rawData)) {
        const parsedText = rawData
          .map((b: any) => b.children?.map((c: any) => c.text).join(""))
          .join("\n\n");
        setModalContent(parsedText);
      } else {
        setModalContent(
          typeof rawData === "string" ? rawData : "Contenido no disponible.",
        );
      }
    } catch (error) {
      setModalContent("Error al cargar la información.");
    } finally {
      setIsLoadingLegal(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    if (!acceptedTerms) {
      setRegisterError(
        "Debes aceptar los términos y condiciones para continuar.",
      );
      return;
    }
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
        },
      );

      const result = await res.json();

      if (!res.ok) {
        setRegisterError(
          result.error?.message || "El usuario o correo ya existe",
        );
        return;
      }

      const sessionRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: result.jwt, user: result.user }),
      });

      if (sessionRes.ok) {
        if (refreshUser) await refreshUser();
        window.location.href = "/profile/edit";
      } else {
        router.push("/login");
      }
    } catch (error) {
      setRegisterError("Ocurrió un error al registrar");
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
      <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-gray-100">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-3xl font-extrabold text-[#012849]">
            Crear cuenta
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Únete a Refacciones Ixoye
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-10 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <RequiredLabel>Usuario</RequiredLabel>
                <Input
                  placeholder="ej: juan_perez"
                  {...register("username")}
                  className="h-11 bg-gray-50/30"
                />
                {errors.username && (
                  <p className="text-xs text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <RequiredLabel>Correo electrónico</RequiredLabel>
                <Input
                  type="email"
                  placeholder="ej: correo@ejemplo.com"
                  {...register("email")}
                  className="h-11 bg-gray-50/30"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <RequiredLabel>Contraseña</RequiredLabel>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  className="h-11 bg-gray-50/30"
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <RequiredLabel>Confirmar contraseña</RequiredLabel>
                <Input
                  type="password"
                  placeholder="Repite tu contraseña"
                  {...register("confirmPassword")}
                  className="h-11 bg-gray-50/30"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(c) => setAcceptedTerms(c as boolean)}
              />
              <div className="text-sm text-gray-600">
                Acepto los{" "}
                <button
                  type="button"
                  onClick={() => openLegalModal("terms-and-condition")}
                  className="text-[#0071b1] font-semibold hover:underline"
                >
                  Términos
                </button>{" "}
                y el{" "}
                <button
                  type="button"
                  onClick={() => openLegalModal("privacy-policy")}
                  className="text-[#0071b1] font-semibold hover:underline"
                >
                  Aviso de Privacidad
                </button>
                .
              </div>
            </div>

            {registerError && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">
                {registerError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#0071b1] hover:bg-[#005a8e] h-12 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </form>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <a
                href="/login"
                className="font-bold text-[#0071b1] hover:underline"
              >
                Inicia sesión
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal Legal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold text-[#012849]">
              {modalTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            <ScrollArea className="h-[400px] sm:h-[500px] w-full rounded-md border p-4 bg-white shadow-inner">
              {isLoadingLegal ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0071b1] border-t-transparent"></div>
                  <span className="text-sm text-gray-500">
                    Cargando contenido...
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line pr-4">
                  {modalContent}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter className="p-6 pt-2 flex flex-row gap-3 sm:justify-end border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
            <Button
              className="bg-[#0071b1] hover:bg-[#005a8e]"
              onClick={() => {
                setAcceptedTerms(true);
                setIsModalOpen(false);
              }}
            >
              Aceptar y continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
