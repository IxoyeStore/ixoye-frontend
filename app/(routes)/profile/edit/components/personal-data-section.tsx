"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, User, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";

type FormState = {
  firstName: string;
  lastName: string;
  motherLastName: string;
  phone: string;
  birthDate: string;
  type: "b2c" | "b2b";
  companyName: string;
};

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  motherLastName: "",
  phone: "",
  birthDate: "",
  type: "b2c",
  companyName: "",
};

export default function PersonalDataSection({
  user,
  defaultExpanded,
}: {
  user: any;
  defaultExpanded: boolean;
}) {
  const { refreshUser } = useAuth();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [original, setOriginal] = useState<FormState>(EMPTY);

  useEffect(() => {
    const profile = user?.profile || user?.users_permissions_user?.profile;
    const initial: FormState = {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      motherLastName: profile?.motherLastName || "",
      phone: profile?.phone || "",
      birthDate: profile?.birthDate ? profile.birthDate.split("T")[0] : "",
      type: profile?.type || "b2c",
      companyName: profile?.companyName || "",
    };
    setForm(initial);
    setOriginal(initial);
  }, [user]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(original),
    [form, original],
  );

  const handleChange = (field: keyof FormState, value: string) => {
    if (["firstName", "lastName", "motherLastName"].includes(field)) {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) return;
    }
    if (field === "phone") {
      if (!/^[0-9]*$/.test(value) || value.length > 10) return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm(original);
    setError(null);
    setExpanded(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const profileDocId =
        user.profile?.documentId || user.users_permissions_user?.profile?.documentId;

      const payload: any = {
        documentId: profileDocId ?? undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        motherLastName: form.motherLastName,
        phone: form.phone,
        birthDate: form.birthDate === "" ? null : form.birthDate,
        type: form.type,
        companyName: form.type === "b2b" ? form.companyName : "",
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar el perfil.");
      }

      await refreshUser?.();
      setOriginal(form);
      setExpanded(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-sky-950/40 flex items-center justify-center shrink-0">
            <User size={16} className="text-[#0071b1] dark:text-sky-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-[#012849] dark:text-sky-300 text-sm">
              Datos personales
            </h2>
            {!expanded && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {fullName || "Sin nombre registrado"}
                {form.phone ? ` · ${form.phone}` : ""}
              </p>
            )}
          </div>
        </div>
        {!expanded && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded(true)}
            className="shrink-0 rounded-xl border-[#0071b1]/30 dark:border-sky-700 text-[#0071b1] dark:text-sky-400"
          >
            <Pencil size={13} className="mr-1.5" /> Editar
          </Button>
        )}
      </div>

      {expanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-100 dark:border-slate-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Nombre(s) *</Label>
              <Input value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Apellido Paterno *</Label>
              <Input value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Apellido Materno</Label>
              <Input value={form.motherLastName} onChange={(e) => handleChange("motherLastName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Teléfono *</Label>
              <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} maxLength={10} />
            </div>
            {form.type === "b2b" && (
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Nombre Comercial</Label>
                <Input value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Fecha de Nacimiento</Label>
              <Input type="date" value={form.birthDate} onChange={(e) => handleChange("birthDate", e.target.value)} />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg text-center font-medium">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl"
            >
              <X size={14} className="mr-1.5" /> Cancelar
            </Button>
            <Button
              className={`flex-1 h-11 font-bold ${
                !hasChanges || saving
                  ? "bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                  : "bg-[#0071b1] hover:bg-[#012849] text-white"
              }`}
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
