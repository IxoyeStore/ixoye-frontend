"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("search", query);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.data || []);
    setTotal(data.meta?.total || 0);
    setLoading(false);
  }, [page, query]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleToggleBlock = async (userId: number, blocked: boolean, username: string) => {
    const action = blocked ? "desbloquear" : "bloquear";
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} a "${username}"?`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !blocked }),
    });
    if (res.ok) {
      toast.success(`Usuario ${blocked ? "desbloqueado" : "bloqueado"}`);
      fetchUsers();
    } else {
      toast.error("Error al actualizar el usuario");
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (userId === me?.id) { toast.error("No puedes eliminarte a ti mismo"); return; }
    if (!confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Usuario eliminado");
      fetchUsers();
    } else {
      toast.error("Error al eliminar el usuario");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-8 space-y-6 w-[85%] mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 italic">Usuarios</h1>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{total} usuarios registrados</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Usuario o correo..."
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-[11px] font-bold focus:outline-none focus:border-sky-400 w-64 bg-white"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
          Buscar
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-black tracking-widest bg-slate-200">
                <th className="text-left px-6 py-5">Usuario</th>
                <th className="text-left px-6 py-5">Correo</th>
                <th className="text-left px-6 py-5">Rol</th>
                <th className="text-left px-6 py-5">Registro</th>
                <th className="text-center px-6 py-5">Estado</th>
                <th className="px-6 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-5">
                      <div className="h-5 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400 font-black uppercase text-[11px] tracking-widest">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                users.map((u: any) => {
                  const isMe = u.id === me?.id;
                  const date = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">{u.username}</span>
                          {isMe && (
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-[9px] font-black uppercase tracking-widest">Tú</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-500">{u.email}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${u.role?.name === "Admin" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"}`}>
                          {u.role?.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500">{date}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${u.blocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {u.blocked ? "Bloqueado" : "Activo"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1">
                          {!isMe && (
                            <>
                              <button
                                onClick={() => handleToggleBlock(u.id, u.blocked, u.username)}
                                title={u.blocked ? "Desbloquear" : "Bloquear"}
                                className={`p-2.5 rounded-lg transition-all ${u.blocked ? "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"}`}
                              >
                                {u.blocked ? <ShieldCheck size={17} /> : <ShieldOff size={17} />}
                              </button>
                              <button
                                onClick={() => handleDelete(u.id, u.username)}
                                className="p-2.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                              >
                                <Trash2 size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-200 disabled:opacity-40 hover:border-sky-300 transition-all"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-200 disabled:opacity-40 hover:border-sky-300 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
