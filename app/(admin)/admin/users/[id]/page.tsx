"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Save, Loader2, Trash2, Plus,
  ShieldCheck, ShieldOff, User, Building2, MapPin,
} from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 transition-colors";

const cardCls =
  "bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

function SaveBtn({ saving, label, onClick }: { saving: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-700 dark:hover:bg-sky-500 text-white text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
    >
      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      {label}
    </button>
  );
}

const EMPTY_ADDR = {
  alias: "", street: "", neighborhood: "", city: "",
  state: "", postalCode: "", references: "", isDefault: false,
};

function AddressForm({
  data,
  onChange,
  onSave,
  onCancel,
  saving,
  isNew = false,
}: {
  data: any;
  onChange: (d: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) {
  const set = (field: string, value: any) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Alias">
          <input className={inputCls} value={data.alias} onChange={(e) => set("alias", e.target.value)} placeholder="Casa, Trabajo..." />
        </Field>
        <Field label="Código Postal">
          <input className={inputCls} value={data.postalCode} onChange={(e) => set("postalCode", e.target.value)} maxLength={5} />
        </Field>
      </div>

      <Field label="Calle y Número">
        <input className={inputCls} value={data.street} onChange={(e) => set("street", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Colonia">
          <input className={inputCls} value={data.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
        </Field>
        <Field label="Ciudad">
          <input className={inputCls} value={data.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Estado">
          <input className={inputCls} value={data.state} onChange={(e) => set("state", e.target.value)} />
        </Field>
        <Field label="Referencias">
          <input className={inputCls} value={data.references} onChange={(e) => set("references", e.target.value)} />
        </Field>
      </div>

      <div
        onClick={() => set("isDefault", !data.isDefault)}
        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
          data.isDefault
            ? "border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-900/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${data.isDefault ? "border-sky-500 bg-sky-500" : "border-slate-300 dark:border-slate-600"}`}>
          {data.isDefault && <span className="text-white text-[10px] leading-none">✓</span>}
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
          Dirección principal
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-700 dark:hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {isNew ? "Crear Dirección" : "Guardar"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  const [account, setAccount] = useState({ username: "", email: "", blocked: false });
  const [savingAccount, setSavingAccount] = useState(false);

  const [profile, setProfile] = useState({
    type: "b2c" as "b2c" | "b2b",
    firstName: "", lastName: "", motherLastName: "",
    phone: "", birthDate: "", companyName: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [editingAddr, setEditingAddr] = useState<string | null>(null);
  const [addrForms, setAddrForms] = useState<Record<string, any>>({});
  const [savingAddr, setSavingAddr] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState<any | null>(null);
  const [savingNew, setSavingNew] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();

      setUserData(json.user);
      setProfileData(json.profile);
      setAddresses(json.addresses);

      setAccount({
        username: json.user?.username || "",
        email: json.user?.email || "",
        blocked: json.user?.blocked || false,
      });

      const p = json.profile;
      setProfile({
        type: p?.type || "b2c",
        firstName: p?.firstName || "",
        lastName: p?.lastName || "",
        motherLastName: p?.motherLastName || "",
        phone: p?.phone || "",
        birthDate: p?.birthDate ? p.birthDate.split("T")[0] : "",
        companyName: p?.companyName || "",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: account.username,
          email: account.email,
          blocked: account.blocked,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Cuenta actualizada");
      fetchDetail();
    } catch {
      toast.error("Error al guardar la cuenta");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: profileData?.documentId,
          userId: Number(id),
          ...profile,
          birthDate: profile.birthDate || null,
          companyName: profile.type === "b2b" ? profile.companyName : "",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perfil actualizado");
      fetchDetail();
    } catch {
      toast.error("Error al guardar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (docId: string) => {
    setSavingAddr(docId);
    try {
      const res = await fetch(`/api/admin/user-address/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrForms[docId]),
      });
      if (!res.ok) throw new Error();
      toast.success("Dirección actualizada");
      setEditingAddr(null);
      fetchDetail();
    } catch {
      toast.error("Error al guardar la dirección");
    } finally {
      setSavingAddr(null);
    }
  };

  const handleDeleteAddress = async (docId: string) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    try {
      const res = await fetch(`/api/admin/user-address/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Dirección eliminada");
      fetchDetail();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleCreateAddress = async () => {
    if (!newAddr) return;
    setSavingNew(true);
    try {
      const res = await fetch("/api/admin/user-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(id), ...newAddr }),
      });
      if (!res.ok) throw new Error();
      toast.success("Dirección creada");
      setNewAddr(null);
      fetchDetail();
    } catch {
      toast.error("Error al crear la dirección");
    } finally {
      setSavingNew(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-black uppercase text-sm">Usuario no encontrado</p>
        <Link href="/admin/users" className="text-sky-600 text-sm font-bold hover:underline">← Volver a usuarios</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-3"
          >
            <ChevronLeft size={13} /> Usuarios
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
            {userData.username}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-bold mt-0.5">{userData.email}</p>
        </div>
        <div className="flex items-center gap-2 sm:mt-8 shrink-0">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
            userData.blocked
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}>
            {userData.blocked ? "Bloqueado" : "Activo"}
          </span>
          {userData.confirmed && (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              Verificado
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Account + Profile */}
        <div className="space-y-6">

          {/* Account */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-700">
              <User size={15} className="text-sky-500" />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Cuenta</h2>
            </div>

            <Field label="Usuario">
              <input className={inputCls} value={account.username} onChange={(e) => setAccount((p) => ({ ...p, username: e.target.value }))} />
            </Field>

            <Field label="Correo electrónico">
              <input className={inputCls} type="email" value={account.email} onChange={(e) => setAccount((p) => ({ ...p, email: e.target.value }))} />
            </Field>

            <div
              onClick={() => setAccount((p) => ({ ...p, blocked: !p.blocked }))}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                account.blocked
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
              }`}
            >
              <div className="flex items-center gap-3">
                {account.blocked
                  ? <ShieldOff size={16} className="text-red-500" />
                  : <ShieldCheck size={16} className="text-emerald-500" />
                }
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {account.blocked ? "Usuario bloqueado" : "Usuario activo"}
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase ${account.blocked ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {account.blocked ? "Activar" : "Bloquear"}
              </span>
            </div>

            <SaveBtn saving={savingAccount} label="Guardar Cuenta" onClick={handleSaveAccount} />
          </div>

          {/* Profile */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-700">
              <User size={15} className="text-sky-500" />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Perfil</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(["b2c", "b2b"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, type: t }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-black ${
                    profile.type === t
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {t === "b2c" ? <User size={14} /> : <Building2 size={14} />}
                  {t === "b2c" ? "Persona" : "Empresa"}
                </button>
              ))}
            </div>

            {profile.type === "b2b" && (
              <Field label="Nombre de la Empresa">
                <input className={inputCls} value={profile.companyName} onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))} />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre(s)">
                <input className={inputCls} value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} />
              </Field>
              <Field label="Ap. Paterno">
                <input className={inputCls} value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} />
              </Field>
              <Field label="Ap. Materno">
                <input className={inputCls} value={profile.motherLastName} onChange={(e) => setProfile((p) => ({ ...p, motherLastName: e.target.value }))} />
              </Field>
              <Field label="Teléfono">
                <input className={inputCls} value={profile.phone} maxLength={10} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} />
              </Field>
              <div className="col-span-2">
                <Field label="Fecha de Nacimiento">
                  <input className={inputCls} type="date" value={profile.birthDate} onChange={(e) => setProfile((p) => ({ ...p, birthDate: e.target.value }))} />
                </Field>
              </div>
            </div>

            <SaveBtn saving={savingProfile} label="Guardar Perfil" onClick={handleSaveProfile} />
          </div>
        </div>

        {/* Right: Addresses */}
        <div className={cardCls}>
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-sky-500" />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Direcciones</h2>
            </div>
            <button
              onClick={() => { setNewAddr({ ...EMPTY_ADDR }); setEditingAddr(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all border border-sky-100 dark:border-sky-800"
            >
              <Plus size={13} /> Nueva
            </button>
          </div>

          {/* New address form */}
          {newAddr && (
            <div className="border-2 border-sky-200 dark:border-sky-800 rounded-xl p-4 bg-sky-50/50 dark:bg-sky-900/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-4">Nueva Dirección</p>
              <AddressForm
                data={newAddr}
                onChange={setNewAddr}
                onSave={handleCreateAddress}
                onCancel={() => setNewAddr(null)}
                saving={savingNew}
                isNew
              />
            </div>
          )}

          {addresses.length === 0 && !newAddr && (
            <p className="text-center py-10 text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest">
              Sin direcciones registradas
            </p>
          )}

          <div className="space-y-3">
            {addresses.map((addr: any) => {
              const docId = addr.documentId || addr.id;
              const isEditing = editingAddr === docId;

              return (
                <div key={docId} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {addr.alias || "Dirección"}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase">
                          Principal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (isEditing) {
                            setEditingAddr(null);
                          } else {
                            setEditingAddr(docId);
                            setNewAddr(null);
                            setAddrForms((prev) => ({
                              ...prev,
                              [docId]: {
                                alias: addr.alias || "",
                                street: addr.street || "",
                                neighborhood: addr.neighborhood || "",
                                city: addr.city || "",
                                state: addr.state || "",
                                postalCode: addr.postalCode || "",
                                references: addr.references || "",
                                isDefault: addr.isDefault || false,
                              },
                            }));
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all"
                      >
                        {isEditing ? "Cancelar" : "Editar"}
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(docId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  {!isEditing && (
                    <div className="px-4 py-3 space-y-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <p className="font-black text-slate-800 dark:text-slate-200">{addr.street}</p>
                      <p>{addr.neighborhood}, {addr.city}, {addr.state} — CP {addr.postalCode}</p>
                      {addr.references && (
                        <p className="italic text-slate-400 dark:text-slate-500">{addr.references}</p>
                      )}
                    </div>
                  )}

                  {/* Edit form */}
                  {isEditing && (
                    <div className="p-4">
                      <AddressForm
                        data={addrForms[docId] || {}}
                        onChange={(updated) => setAddrForms((prev) => ({ ...prev, [docId]: updated }))}
                        onSave={() => handleSaveAddress(docId)}
                        onCancel={() => setEditingAddr(null)}
                        saving={savingAddr === docId}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
