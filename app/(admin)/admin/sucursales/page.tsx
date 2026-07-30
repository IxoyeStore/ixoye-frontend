"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

type SucursalForm = { name: string; address: string; mapsUrl: string };

const EMPTY_FORM: SucursalForm = { name: "", address: "", mapsUrl: "" };

const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2.5 text-[12px] font-bold bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:border-sky-400 transition-colors";

export default function AdminSucursalesPage() {
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SucursalForm>(EMPTY_FORM);

  const fetchSucursales = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/sucursales");
    const data = await res.json();
    setSucursales(data.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSucursales(); }, [fetchSucursales]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (s: any) => {
    setForm({ name: s.name || "", address: s.address || "", mapsUrl: s.mapsUrl || "" });
    setEditing(s);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const setField = (field: keyof SucursalForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editing ? `/api/admin/sucursales/${editing.documentId || editing.id}` : "/api/admin/sucursales";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success(editing ? "Sucursal actualizada" : "Sucursal creada");
      closeForm();
      fetchSucursales();
    } else {
      toast.error("Error al guardar la sucursal");
    }
    setSaving(false);
  };

  const handleDelete = async (s: any) => {
    if (!confirm(`¿Eliminar la sucursal "${s.name}"?`)) return;
    const res = await fetch(`/api/admin/sucursales/${s.documentId || s.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Sucursal eliminada");
      fetchSucursales();
    } else {
      toast.error("Error al eliminar la sucursal");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full md:w-[85%] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">Sucursales</h1>
          <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest">{sucursales.length} sucursales</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 dark:shadow-sky-900/30"
        >
          <Plus size={16} /> Nueva Sucursal
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-sky-200 dark:border-sky-700 shadow-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              {editing ? "Editar Sucursal" : "Nueva Sucursal"}
            </h2>
            <button onClick={closeForm} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={setField("name")}
                required
                className={inputCls}
                placeholder="Ej: Sucursal Libramiento Matriz"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={setField("address")}
                required
                className={inputCls}
                placeholder="Calle, colonia, CP, ciudad, estado"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Link de Google Maps <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form.mapsUrl}
                onChange={setField("mapsUrl")}
                required
                className={inputCls}
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 transition-all">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase font-black tracking-widest bg-slate-200 dark:bg-slate-700/50">
              <th className="text-left px-4 md:px-6 py-5">Nombre</th>
              <th className="text-left px-4 md:px-6 py-5 hidden sm:table-cell">Dirección</th>
              <th className="px-4 md:px-6 py-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={3} className="px-6 py-5">
                    <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : sucursales.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-20 text-slate-400 dark:text-slate-500 font-black uppercase text-[11px] tracking-widest">
                  Sin sucursales
                </td>
              </tr>
            ) : (
              sucursales.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 md:px-6 py-5 font-black text-slate-900 dark:text-white text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-sky-500 shrink-0" />
                      {s.name}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{s.address}</td>
                  <td className="px-4 md:px-6 py-5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2.5 rounded-lg text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 transition-all"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-2.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
