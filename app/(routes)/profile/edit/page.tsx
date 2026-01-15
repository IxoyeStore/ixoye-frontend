/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    motherLastName: "",
    phone: "",
    birthDate: "",
  });

  useEffect(() => {
    if (user?.users_permissions_user) {
      const data =
        user.users_permissions_user.attributes || user.users_permissions_user;
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        motherLastName: data.motherLastName || "",
        phone: data.phone || "",
        birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
      });
    }
  }, [user]);

  const validateText = (text: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(text);
  const validatePhone = (phone: string) => /^[0-9]*$/.test(phone);

  const handleChange = (field: string, value: string) => {
    if (["firstName", "lastName", "motherLastName"].includes(field)) {
      if (!validateText(value)) return;
    }

    if (field === "phone") {
      if (!validatePhone(value) || value.length > 10) return;
    }

    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleSave = async () => {
    if (!user) return;

    const newErrors: { [key: string]: string } = {};
    if (!form.firstName.trim())
      newErrors.firstName = "El nombre es obligatorio";
    if (!form.lastName.trim())
      newErrors.lastName = "El apellido es obligatorio";
    if (form.phone.length > 0 && form.phone.length < 10)
      newErrors.phone = "El teléfono debe tener 10 dígitos";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    const profile = user.users_permissions_user;
    const docId = profile?.documentId || profile?.id;

    const url = docId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${docId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/profiles`;

    const method = docId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({
          data: {
            ...form,
            users_permissions_user: user.id,
          },
        }),
      });

      const errorData = await res.json();

      if (res.ok) {
        if (refreshUser) await refreshUser();
        router.push("/profile");
      } else {
        const errorMessage = errorData.error?.message || "";
        const isDuplicatePhone =
          errorMessage.toLowerCase().includes("phone") ||
          JSON.stringify(errorData).includes("unique");

        if (isDuplicatePhone) {
          setErrors({
            phone:
              "Este número de teléfono ya está registrado por otro usuario",
          });
        } else {
          alert(
            "Error al guardar: " + (errorData.error?.message || "Desconocido")
          );
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión al servidor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen">
      <Link
        href="/profile"
        className="flex items-center text-sm text-slate-500 hover:text-[#0055a4] mb-6 transition-colors font-semibold group"
      >
        <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Volver al perfil
      </Link>

      <Card className="shadow-xl border border-blue-50">
        <CardHeader className="border-b border-blue-50 bg-slate-50/50 rounded-t-lg">
          <CardTitle className="text-2xl font-black text-[#001e36]">
            Editar Información
          </CardTitle>
          <p className="text-sm text-slate-500">
            Actualiza tus datos personales{" "}
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="text-[#001e36] font-bold">Nombre(s)</Label>
            <Input
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={
                errors.firstName
                  ? "border-destructive ring-destructive"
                  : "border-slate-200 focus-visible:ring-[#0055a4] focus-visible:border-[#0055a4]"
              }
            />
            {errors.firstName && (
              <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3 h-3" /> {errors.firstName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#001e36] font-bold">
                Apellido Paterno
              </Label>
              <Input
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={
                  errors.lastName
                    ? "border-destructive ring-destructive"
                    : "border-slate-200 focus-visible:ring-[#0055a4]"
                }
              />
              {errors.lastName && (
                <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3" /> {errors.lastName}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[#001e36] font-bold">
                Apellido Materno
              </Label>
              <Input
                value={form.motherLastName}
                onChange={(e) => handleChange("motherLastName", e.target.value)}
                className="border-slate-200 focus-visible:ring-[#0055a4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#001e36] font-bold">
                Teléfono (10 dígitos)
              </Label>
              <Input
                type="text"
                placeholder="5551234567"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={
                  errors.phone
                    ? "border-destructive ring-destructive"
                    : "border-slate-200 focus-visible:ring-[#0055a4]"
                }
              />
              {errors.phone && (
                <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[#001e36] font-bold">
                Fecha de Nacimiento
              </Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className="border-slate-200 focus-visible:ring-[#0055a4]"
              />
            </div>
          </div>

          <Button
            className="w-full mt-6 bg-[#0055a4] hover:bg-[#003d7a] text-white py-6 shadow-lg transition-all active:scale-[0.98] font-black text-base uppercase tracking-wider"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" /> Guardar Cambios
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
