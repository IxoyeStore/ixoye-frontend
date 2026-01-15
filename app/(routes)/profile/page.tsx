"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Calendar,
  UserCircle,
  LogOut,
  Settings2,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse italic text-sky-700">
        Cargando perfil...
      </div>
    );
  if (!user) return null;

  const profile = user.users_permissions_user;
  const data = profile?.attributes || profile;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-sky-700">
          Mi Perfil
        </h1>
        <div className="flex gap-2">
          <Link href="/profile/edit">
            <Button
              variant="outline"
              className="gap-2 border-sky-200 text-sky-700 hover:bg-sky-50"
            >
              <Settings2 className="w-4 h-4" />
              {profile ? "Editar Datos" : "Crear Perfil"}
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={logout}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="shadow-2xl shadow-sky-100/50 border-none overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-white border-b border-sky-100 pb-8 pt-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-md border border-sky-100">
              <UserCircle className="w-20 h-20 text-sky-700" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-sky-900">
                {user.username}
              </CardTitle>
              <p className="text-sky-600/80 font-medium">{user.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-10 bg-white">
          {!profile ? (
            <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/30">
              <p className="text-sky-800/70 mb-4 font-medium">
                Aún no has configurado tu información personal para compras.
              </p>
              <Link href="/profile/edit">
                <Button className="bg-sky-700 hover:bg-sky-800 text-white">
                  Completar ahora
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoBlock
                label="Nombre(s)"
                value={data.firstName}
                icon={<User size={18} />}
              />
              <InfoBlock
                label="Apellido Paterno"
                value={data.lastName}
                icon={<User size={18} />}
              />
              <InfoBlock
                label="Apellido Materno"
                value={data.motherLastName}
                icon={<User size={18} />}
              />
              <InfoBlock
                label="Teléfono"
                value={data.phone || "No asignado"}
                icon={<Phone size={18} />}
              />
              <InfoBlock
                label="Fecha de Nacimiento"
                value={data.birthDate || "No asignada"}
                icon={<Calendar size={18} />}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100/80 cursor-default select-none shadow-sm">
      <div className="text-sky-600 mb-2">{icon}</div>
      <p className="text-[10px] font-black uppercase text-sky-800/50 tracking-widest">
        {label}
      </p>
      <p className="text-md font-bold text-sky-900 truncate">{value}</p>
    </div>
  );
}
