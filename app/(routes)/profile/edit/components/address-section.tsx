"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, Pencil, X } from "lucide-react";
import { ubicaciones } from "@/constants/cities-and-states";
import cpMexico from "@/lib/cp-mexico.json";

const MEXICO_STATES = Object.keys(ubicaciones) as (keyof typeof ubicaciones)[];

type AddressForm = {
  alias: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  references: string;
  isDefault: boolean;
};

const EMPTY: AddressForm = {
  alias: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
  references: "",
  isDefault: false,
};

export default function AddressSection({
  user,
  addressId,
  isNewAddress,
  defaultExpanded,
}: {
  user: any;
  addressId: string | null;
  isNewAddress: boolean;
  defaultExpanded: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpError, setCpError] = useState(false);
  const [coloniasSugeridas, setColoniasSugeridas] = useState<string[]>([]);
  const [showColonias, setShowColonias] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<{ cost: number; label: string } | null>(null);
  const [currentAddressId, setCurrentAddressId] = useState<string | null>(addressId);

  const [form, setForm] = useState<AddressForm>(EMPTY);
  const [original, setOriginal] = useState<AddressForm>(EMPTY);

  // Este componente se monta fresco cada vez (el padre le da un `key`
  // distinto por addressId/"new"), asi que este efecto solo corre una vez
  // por direccion objetivo: nunca hereda datos de la direccion anterior.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchData = async () => {
      if (isNewAddress) {
        setForm(EMPTY);
        setOriginal(EMPTY);
        setLoading(false);
        return;
      }

      try {
        let addrData = null;

        if (addressId) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${addressId}`,
            { headers: { Authorization: `Bearer ${user.jwt}` } },
          );
          const json = await res.json();
          addrData = json.data;
        } else {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/addresses?filters[users_permissions_user][id][$eq]=${user.id}&filters[isDefault][$eq]=true`,
            { headers: { Authorization: `Bearer ${user.jwt}` } },
          );
          const json = await res.json();
          if (json.data?.length > 0) addrData = json.data[0];
        }

        if (cancelled) return;

        if (addrData) {
          const initial: AddressForm = {
            alias: addrData.alias || "",
            street: addrData.street || "",
            neighborhood: addrData.neighborhood || "",
            city: addrData.city || "",
            state: addrData.state || "",
            postalCode: addrData.postalCode || "",
            references: addrData.references || "",
            isDefault: addrData.isDefault || false,
          };
          setForm(initial);
          setOriginal(initial);
          setCurrentAddressId(addrData.documentId || null);
        } else {
          setForm(EMPTY);
          setOriginal(EMPTY);
        }
      } catch {
        setForm(EMPTY);
        setOriginal(EMPTY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Autocompletado de estado/ciudad/colonias a partir del CP
  useEffect(() => {
    if (form.postalCode.length !== 5) {
      setColoniasSugeridas([]);
      setCpError(false);
      setShippingQuote(null);
      return;
    }

    const entry = (cpMexico as Record<string, { e: string; m: string; c: string[] }>)[form.postalCode];

    if (!entry) {
      setCpError(true);
      setColoniasSugeridas([]);
      setShippingQuote(null);
      return;
    }

    setCpError(false);

    let nombreEstado = entry.e;
    if (nombreEstado === "México") nombreEstado = "Estado de México";
    if (nombreEstado === "Distrito Federal") nombreEstado = "Ciudad de México";

    let cost = 0;
    let label = "Entrega Local Gratis";
    if (entry.e !== "Nayarit") {
      cost = -1;
      label = "Envío no disponible";
    }
    setShippingQuote({ cost, label });

    const listaColonias = entry.c || [];
    setColoniasSugeridas(listaColonias);
    if (listaColonias.length > 1 && !listaColonias.includes(form.neighborhood)) {
      setShowColonias(true);
    }

    setForm((prev) => ({
      ...prev,
      state: nombreEstado,
      city: entry.m,
      neighborhood:
        listaColonias.length === 1
          ? listaColonias[0]
          : listaColonias.includes(prev.neighborhood)
            ? prev.neighborhood
            : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.postalCode]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(original) || isNewAddress,
    [form, original, isNewAddress],
  );

  type Key = keyof AddressForm;
  const handleChange = (field: Key, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "state") next.city = "";
      return next;
    });
  };

  const handleCancel = () => {
    setForm(original);
    setError(null);
    setExpanded(false);
  };

  const handleSave = async () => {
    if (!user) return;

    const hasAddress =
      form.street.trim() &&
      form.postalCode.length >= 5 &&
      form.neighborhood.trim() &&
      form.state.trim() &&
      form.city.trim();

    if (!hasAddress) {
      setError("Completa calle, código postal, colonia, estado y ciudad.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const jwt = user.jwt;

      if (form.isDefault) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/addresses?filters[users_permissions_user][id][$eq]=${user.id}&filters[isDefault][$eq]=true`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );
        const { data: defaultAddresses } = await res.json();
        if (Array.isArray(defaultAddresses)) {
          for (const addr of defaultAddresses) {
            if (addr.documentId && addr.documentId !== currentAddressId) {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${addr.documentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
                body: JSON.stringify({ data: { isDefault: false } }),
              });
            }
          }
        }
      }

      const isUpdating = !!currentAddressId && !isNewAddress;
      const url = isUpdating
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${currentAddressId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/addresses`;

      const res = await fetch(url, {
        method: isUpdating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ data: { ...form, users_permissions_user: user.id } }),
      });

      if (!res.ok) throw new Error("Error al guardar la dirección.");
      const saved = await res.json();
      const savedDocId = saved.data?.documentId || currentAddressId;

      setCurrentAddressId(savedDocId);
      setOriginal(form);
      setExpanded(false);

      if (!addressId && savedDocId) {
        router.replace(`/profile/edit?addressId=${savedDocId}`, { scroll: false });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const summary = [form.street, [form.city, form.state].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-sky-950/40 flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-[#0071b1] dark:text-sky-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-[#012849] dark:text-sky-300 text-sm">
              {isNewAddress ? "Nueva dirección de envío" : "Dirección de envío"}
            </h2>
            {!expanded && !loading && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {summary || "Sin dirección registrada"}
              </p>
            )}
          </div>
        </div>
        {!expanded && !loading && (
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

      {loading && (
        <div className="px-6 pb-6">
          <Loader2 className="animate-spin text-[#0071b1]" size={20} />
        </div>
      )}

      {expanded && !loading && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-100 dark:border-slate-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">
                Nombre de la dirección (alias)
              </Label>
              <Input
                placeholder="Ej. Casa, Trabajo, ..."
                value={form.alias}
                onChange={(e) => handleChange("alias", e.target.value)}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Calle y Número *</Label>
              <Input value={form.street} onChange={(e) => handleChange("street", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label className={`text-sm font-bold ${cpError ? "text-red-500 dark:text-red-400" : "text-[#012849] dark:text-sky-300"}`}>
                Código Postal *
              </Label>
              <Input
                value={form.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value.replace(/\D/g, ""))}
                maxLength={5}
                className={cpError ? "border-red-500 dark:border-red-500 focus:ring-red-500" : ""}
              />
              {shippingQuote && (
                <div className="flex items-center gap-1.5 mt-1 animate-in fade-in duration-300">
                  <div className={`h-1.5 w-1.5 rounded-full ${shippingQuote.cost === 0 ? "bg-green-500" : "bg-amber-500"}`} />
                  <p className={`text-xs font-medium ${shippingQuote.cost === 0 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {shippingQuote.cost === 0 ? "Entrega Local: ¡Gratis!" : "Envío no disponible — comunícate con nosotros"}
                  </p>
                </div>
              )}
              {cpError && (
                <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  CP no encontrado. Por favor, verifica los 5 dígitos.
                </p>
              )}
            </div>

            <div className="space-y-1.5 relative">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Colonia *</Label>
              <div className="relative">
                <Input
                  placeholder="Selecciona tu colonia"
                  value={form.neighborhood}
                  readOnly={coloniasSugeridas.length > 0}
                  onClick={() => setShowColonias(!showColonias)}
                  onChange={(e) => handleChange("neighborhood", e.target.value)}
                  className="cursor-pointer bg-white dark:bg-slate-800"
                />
                {showColonias && coloniasSugeridas.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowColonias(false)} />
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 space-y-1">
                        {coloniasSugeridas.map((col, idx) => (
                          <button
                            key={`${idx}-${col}`}
                            type="button"
                            className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors ${
                              form.neighborhood === col
                                ? "bg-blue-50 dark:bg-sky-950/40 text-[#0071b1] dark:text-sky-400 font-bold"
                                : "hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                            }`}
                            onClick={() => {
                              handleChange("neighborhood", col);
                              setShowColonias(false);
                            }}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Estado *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 dark:border-slate-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0071b1] text-black dark:text-white"
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              >
                <option value="">Selecciona Estado</option>
                {MEXICO_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Ciudad *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-800 dark:border-slate-600 px-3 py-2 text-sm text-black dark:text-white"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled={!form.state}
              >
                <option value="">Selecciona Ciudad</option>
                {form.city && form.state &&
                  !(ubicaciones[form.state as keyof typeof ubicaciones] as unknown as readonly string[])?.includes(form.city) && (
                    <option value={form.city}>{form.city}</option>
                  )}
                {form.state &&
                  ubicaciones[form.state as keyof typeof ubicaciones]?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300">Referencias (Opcional)</Label>
              <Input
                placeholder="Ej. Portón café..."
                value={form.references}
                onChange={(e) => handleChange("references", e.target.value)}
              />
            </div>
          </div>

          <div
            onClick={() => handleChange("isDefault", !form.isDefault)}
            className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              form.isDefault
                ? "border-[#0071b1] bg-blue-50/50 dark:bg-sky-950/30"
                : "border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600"
            }`}
          >
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={(checked) => handleChange("isDefault", checked)}
              className="data-[state=checked]:bg-[#0071b1] data-[state=checked]:border-[#0071b1]"
            />
            <div className="space-y-0.5 cursor-pointer">
              <Label className="text-sm font-bold text-[#012849] dark:text-sky-300 cursor-pointer">
                Establecer como dirección principal
              </Label>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                Usar esta dirección por defecto para mis pedidos.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg text-center font-medium">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            {!isNewAddress && (
              <Button variant="outline" onClick={handleCancel} disabled={saving} className="rounded-xl">
                <X size={14} className="mr-1.5" /> Cancelar
              </Button>
            )}
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
              {isNewAddress ? "Crear Dirección" : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
