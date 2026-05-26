"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirmation: "",
  });
  const [show, setShow] = useState({
    currentPassword: false,
    password: false,
    passwordConfirmation: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleShow = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (form.password !== form.passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.jwt}`,
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            password: form.password,
            passwordConfirmation: form.passwordConfirmation,
          }),
        },
      );

      if (res.ok) {
        setSuccess(true);
        setForm({ currentPassword: "", password: "", passwordConfirmation: "" });
      } else {
        const data = await res.json();
        const msg = data.error?.message || "";
        if (msg === "Your new password must be different than your current password") {
          setError("La nueva contraseña debe ser diferente a la actual.");
        } else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("password")) {
          setError("La contraseña actual es incorrecta.");
        } else {
          setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
        }
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "currentPassword", label: "Contraseña actual" },
    { key: "password", label: "Nueva contraseña" },
    { key: "passwordConfirmation", label: "Confirmar nueva contraseña" },
  ] as const;

  return (
    <div className="flex justify-center items-center py-10 px-4 bg-gray-50/50 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/profile"
          className="inline-flex items-center text-sm font-semibold text-[#0071b1] hover:text-[#012849] group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Volver al perfil
        </Link>

        <Card className="shadow-xl border-none ring-1 ring-gray-100">
          <CardHeader className="text-center pt-8 border-b border-gray-100">
            <CardTitle className="text-2xl font-extrabold text-[#012849]">
              Cambiar contraseña
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Elige una contraseña segura de al menos 8 caracteres.
            </p>
          </CardHeader>

          <CardContent className="px-8 py-8">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <p className="font-bold text-[#012849]">
                  ¡Contraseña actualizada correctamente!
                </p>
                <Link href="/profile">
                  <Button className="bg-[#0071b1] hover:bg-[#012849] text-white rounded-full px-8">
                    Volver al perfil
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-sm font-bold text-[#012849]">
                      {label}
                    </Label>
                    <div className="relative">
                      <Input
                        type={show[key] ? "text" : "password"}
                        value={form[key]}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="border-gray-200 focus-visible:ring-[#0071b1] h-11 bg-gray-50/30 pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow(key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0071b1] transition-colors"
                        tabIndex={-1}
                      >
                        {show[key] ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                ))}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center font-medium border border-red-100">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#0071b1] hover:bg-[#012849] text-white font-bold mt-2 shadow-lg transition-all active:scale-[0.98]"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    "Actualizar contraseña"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
