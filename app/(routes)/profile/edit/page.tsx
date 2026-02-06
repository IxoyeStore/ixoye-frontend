"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Building2, User, Loader2, Info } from "lucide-react";
import { ubicaciones } from "@/constants/cities-and-states";
import Link from "next/link";

const MEXICO_STATES = Object.keys(ubicaciones) as (keyof typeof ubicaciones)[];
const COPOMEX_TOKEN = "90bf7482-083d-4584-a0db-2a59019d4957";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");
  const isNewAddress = searchParams.get("new") === "true";
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCP, setLoadingCP] = useState(false);
  const [cpError, setCpError] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [coloniasSugericdas, setColoniasSugeridas] = useState<string[]>([]);

  const [originalData, setOriginalData] = useState({
    form: {},
    address: {},
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    motherLastName: "",
    phone: "",
    birthDate: "",
    type: "b2c" as "b2c" | "b2b",
    companyName: "",
  });

  const [addressForm, setAddressForm] = useState({
    alias: "",
    street: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    references: "",
    isDefault: false,
  });

  const hasChanges = useMemo(() => {
    const formChanged =
      JSON.stringify(form) !== JSON.stringify(originalData.form);
    const addressChanged =
      JSON.stringify(addressForm) !== JSON.stringify(originalData.address);
    return formChanged || addressChanged || isNewAddress;
  }, [form, addressForm, originalData, isNewAddress]);

  useEffect(() => {
    const fetchCP = async () => {
      if (addressForm.postalCode.length === 5) {
        setLoadingCP(true);
        setCpError(false);
        try {
          const res = await fetch(
            `https://api.copomex.com/query/info_cp/${addressForm.postalCode}?token=${COPOMEX_TOKEN}`,
          );

          if (!res.ok) {
            setCpError(false);
            setColoniasSugeridas([]);
            return;
          }

          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            const listaColonias = data.map(
              (item: any) => item.response.asentamiento,
            );
            setColoniasSugeridas(listaColonias);
            const info = data[0].response;

            setAddressForm((prev) => ({
              ...prev,
              state: info.estado,
              city: info.municipio,
              neighborhood: info.asentamiento,
            }));
          } else {
            setCpError(true);
            setColoniasSugeridas([]);
          }
        } catch (error) {
          setCpError(false);
          setLoadingCP(false);
        } finally {
          setLoadingCP(false);
        }
      } else {
        setColoniasSugeridas([]);
        setCpError(false);
      }
    };
    fetchCP();
  }, [addressForm.postalCode]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const profile = user.profile || user.users_permissions_user?.profile;
      const data = profile;

      const initialForm = {
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        motherLastName: data?.motherLastName || "",
        phone: data?.phone || "",
        birthDate: data?.birthDate ? data?.birthDate.split("T")[0] : "",
        type: data?.type || "b2c",
        companyName: data?.companyName || "",
      };

      let initialAddress = {
        alias: "",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        postalCode: "",
        references: "",
        isDefault: false,
      };

      setForm(initialForm);

      if (isNewAddress) {
        setAddressForm(initialAddress);
      } else {
        try {
          let addrData = null;

          if (addressId) {
            const res = await fetch(
              `https://ixoye-backend-production.up.railway.app/api/addresses/${addressId}`,
              { headers: { Authorization: `Bearer ${user.jwt}` } },
            );
            const json = await res.json();
            addrData = json.data;
          } else {
            const userId = user.id;
            const res = await fetch(
              `https://ixoye-backend-production.up.railway.app/api/addresses?filters[users_permissions_user][id][$eq]=${userId}&filters[isDefault][$eq]=true`,
              { headers: { Authorization: `Bearer ${user.jwt}` } },
            );
            const json = await res.json();
            if (json.data && json.data.length > 0) {
              addrData = json.data[0];
            }
          }

          if (addrData) {
            initialAddress = {
              alias: addrData.alias || "",
              street: addrData.street || "",
              neighborhood: addrData.neighborhood || "",
              city: addrData.city || "",
              state: addrData.state || "",
              postalCode: addrData.postalCode || "",
              references: addrData.references || "",
              isDefault: addrData.isDefault || false,
            };
            setAddressForm(initialAddress);

            if (!addressId && addrData.documentId) {
              router.replace(`/profile/edit?addressId=${addrData.documentId}`, {
                scroll: false,
              });
            }
          }
        } catch (error) {
          console.error("Error cargando dirección:", error);
        }
      }

      setOriginalData({
        form: initialForm,
        address: initialAddress,
      });
      setLoading(false);
    };
    fetchData();
  }, [user, addressId, isNewAddress, router]);

  const handleChange = (field: string, value: string) => {
    if (["firstName", "lastName", "motherLastName"].includes(field)) {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) return;
    }
    if (field === "phone") {
      if (!/^[0-9]*$/.test(value) || value.length > 10) return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: any) => {
    setAddressForm((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === "state") newState.city = "";
      return newState;
    });
  };

  const handleSave = async () => {
    if (
      addressForm.street.trim() === "" ||
      addressForm.postalCode.length < 5 ||
      addressForm.neighborhood.trim() === "" ||
      addressForm.state.trim() === "" ||
      addressForm.city.trim() === ""
    ) {
      setErrors({
        general:
          "Por favor completa todos los campos obligatorios (*) de la dirección.",
      });
      return;
    }

    if (!user || loadingCP) return;
    setSaving(true);
    setErrors({});

    try {
      const jwt = user.jwt;
      const userId = user.id;

      if (addressForm.isDefault) {
        const addrRes = await fetch(
          `https://ixoye-backend-production.up.railway.app/api/addresses?filters[users_permissions_user][id][$eq]=${userId}&filters[isDefault][$eq]=true`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );
        const { data: defaultAddresses } = await addrRes.json();

        if (defaultAddresses && Array.isArray(defaultAddresses)) {
          for (const addr of defaultAddresses) {
            const docId = addr.documentId;
            if (docId && docId !== addressId) {
              await fetch(
                `https://ixoye-backend-production.up.railway.app/api/addresses/${docId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                  },
                  body: JSON.stringify({ data: { isDefault: false } }),
                },
              );
            }
          }
        }
      }

      const profileDocId =
        user.profile?.documentId ||
        user.users_permissions_user?.profile?.documentId;

      const profileData: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        motherLastName: form.motherLastName,
        phone: form.phone,
        birthDate: form.birthDate === "" ? null : form.birthDate,
        type: form.type,
        companyName: form.type === "b2b" ? form.companyName : "",
      };

      if (profileDocId) {
        await fetch(
          `https://ixoye-backend-production.up.railway.app/api/profiles/${profileDocId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ data: profileData }),
          },
        );
      }

      const isUpdatingAddress = addressId && !isNewAddress;
      const addrUrl = isUpdatingAddress
        ? `https://ixoye-backend-production.up.railway.app/api/addresses/${addressId}`
        : `https://ixoye-backend-production.up.railway.app/api/addresses`;

      const addrRes = await fetch(addrUrl, {
        method: isUpdatingAddress ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: { ...addressForm, users_permissions_user: userId },
        }),
      });

      if (!addrRes.ok) throw new Error("Error al guardar la dirección.");

      await refreshUser?.();
      router.push(
        "/profile?tab=" +
          (isUpdatingAddress || isNewAddress ? "addresses" : "info"),
      );
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#0071b1]" />
      </div>
    );

  return (
    <div className="flex justify-center items-center py-10 px-4 bg-gray-50/50 min-h-[calc(100vh-80px)] text-black">
      <div className="w-full max-w-2xl space-y-4">
        <Link
          href="/profile"
          className="inline-flex items-center text-sm font-semibold text-[#0071b1] hover:text-[#012849] group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1" />
          Volver al perfil
        </Link>

        <Card className="shadow-xl border-none ring-1 ring-gray-100">
          <CardHeader className="text-center pt-8 border-b border-gray-100">
            <CardTitle className="text-3xl font-extrabold text-[#012849]">
              {isNewAddress
                ? "Agregar Nueva Dirección"
                : addressId
                  ? "Editar Dirección"
                  : "Editar Perfil"}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-8 py-8 space-y-8">
            {/* TIPO DE CUENTA */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-[#012849]">
                Tipo de Cuenta
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    form.type === "b2c"
                      ? "border-[#0071b1] bg-blue-50 text-[#0071b1]"
                      : "border-gray-100 text-gray-400 bg-gray-50/50 cursor-not-allowed"
                  }`}
                >
                  <User className="w-5 h-5 mr-2" />{" "}
                  <span className="font-bold text-sm">Persona</span>
                </div>
                <div
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    form.type === "b2b"
                      ? "border-[#0071b1] bg-blue-50 text-[#0071b1]"
                      : "border-gray-100 text-gray-400 bg-gray-50/50 cursor-not-allowed"
                  }`}
                >
                  <Building2 className="w-5 h-5 mr-2" />{" "}
                  <span className="font-bold text-sm">Empresa</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {form.type === "b2b" && (
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-sm font-bold text-[#012849]">
                    Nombre de la Empresa
                  </Label>
                  <Input
                    value={form.companyName}
                    onChange={(e) =>
                      handleChange("companyName", e.target.value)
                    }
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-[#012849]">
                  Nombre(s) *
                </Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-[#012849]">
                  Apellido Paterno *
                </Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-[#012849]">
                  Apellido Materno
                </Label>
                <Input
                  value={form.motherLastName}
                  onChange={(e) =>
                    handleChange("motherLastName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-[#012849]">
                  Teléfono *
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  maxLength={10}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-[#012849] flex items-center">
                  Fecha de Nacimiento
                  <Info size={14} className="ml-1.5 text-slate-400" />
                </Label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className="block w-full"
                />
              </div>

              {/* DIRECCIÓN */}
              <div className="md:col-span-2 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <h3 className="md:col-span-2 font-bold text-[#012849]">
                  Información de Entrega
                </h3>

                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-sm font-bold text-[#012849]">
                    Calle y Número *
                  </Label>
                  <Input
                    value={addressForm.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    className={`text-sm font-bold ${
                      cpError ? "text-red-500" : "text-[#012849]"
                    }`}
                  >
                    Código Postal *
                  </Label>
                  <Input
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      handleAddressChange(
                        "postalCode",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    maxLength={5}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-[#012849]">
                    Colonia *
                  </Label>
                  <Input
                    list="neighborhood-list"
                    value={addressForm.neighborhood}
                    onChange={(e) =>
                      handleAddressChange("neighborhood", e.target.value)
                    }
                  />
                  <datalist id="neighborhood-list">
                    {coloniasSugericdas.map((col, idx) => (
                      <option key={idx} value={col} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-[#012849]">
                    Estado *
                  </Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0071b1]"
                    value={addressForm.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                  >
                    <option value="">Selecciona Estado</option>
                    {MEXICO_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-[#012849]">
                    Ciudad *
                  </Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0071b1] disabled:opacity-50"
                    value={addressForm.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    disabled={!addressForm.state}
                  >
                    <option value="">Selecciona Ciudad</option>
                    {addressForm.state &&
                      ubicaciones[
                        addressForm.state as keyof typeof ubicaciones
                      ]?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-sm font-bold text-[#012849]">
                    Referencias (Opcional)
                  </Label>
                  <Input
                    placeholder="Ej. Portón café..."
                    value={addressForm.references}
                    onChange={(e) =>
                      handleAddressChange("references", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <div
                onClick={() =>
                  handleAddressChange("isDefault", !addressForm.isDefault)
                }
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  addressForm.isDefault
                    ? "border-[#0071b1] bg-blue-50/50"
                    : "border-gray-100 bg-gray-50/30 hover:border-gray-200"
                }`}
              >
                <Checkbox
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onCheckedChange={(checked) =>
                    handleAddressChange("isDefault", checked)
                  }
                  className="data-[state=checked]:bg-[#0071b1] data-[state=checked]:border-[#0071b1]"
                />
                <div className="space-y-0.5 cursor-pointer">
                  <Label
                    htmlFor="isDefault"
                    className="text-sm font-bold text-[#012849] cursor-pointer"
                  >
                    Establecer como dirección principal
                  </Label>
                  <p className="text-xs text-gray-500 font-medium">
                    Usa esta dirección por defecto para tus pedidos rápidos.
                  </p>
                </div>
              </div>
            </div>

            {errors.general && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center font-medium">
                {errors.general}
              </p>
            )}

            <Button
              className={`w-full h-12 font-bold transition-all ${
                !hasChanges || saving || loadingCP
                  ? "bg-gray-300 text-gray-500"
                  : "bg-[#0071b1] hover:bg-[#012849] text-white"
              }`}
              onClick={handleSave}
              disabled={!hasChanges || saving || loadingCP}
            >
              {saving ? (
                <Loader2 className="animate-spin mr-2" />
              ) : isNewAddress ? (
                "Crear Dirección"
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
