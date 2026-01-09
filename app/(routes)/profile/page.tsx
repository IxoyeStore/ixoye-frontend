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
      <div className="p-20 text-center animate-pulse italic">
        Cargando perfil...
      </div>
    );
  if (!user) return null;

  const profile = user.users_permissions_user;
  const data = profile?.attributes || profile;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <div className="flex gap-2">
          <Link href="/profile/edit">
            <Button variant="outline" className="gap-2">
              <Settings2 className="w-4 h-4" />
              {profile ? "Editar Datos" : "Crear Perfil"}
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={logout}
            className="text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="shadow-xl border-none">
        <CardHeader className="bg-primary/5 border-b pb-8 pt-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="bg-background p-2 rounded-full shadow-sm">
              <UserCircle className="w-20 h-20 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {user.username}
              </CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-10">
          {!profile ? (
            <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground mb-4">
                Aún no has configurado tu información personal para compras.
              </p>
              <Link href="/profile/edit">
                <Button>Completar ahora</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoBlock
                label="Nombre(s)"
                value={data.firstName}
                icon={<User />}
              />
              <InfoBlock
                label="Apellido Paterno"
                value={data.lastName}
                icon={<User />}
              />
              <InfoBlock
                label="Apellido Materno"
                value={data.motherLastName}
                icon={<User />}
              />
              <InfoBlock
                label="Teléfono"
                value={data.phone || "No asignado"}
                icon={<Phone />}
              />
              <InfoBlock
                label="Fecha de Nacimiento"
                value={data.birthDate || "No asignada"}
                icon={<Calendar />}
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
    <div className="p-4 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-colors">
      <div className="text-primary/60 mb-2">{icon}</div>
      <p className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">
        {label}
      </p>
      <p className="text-md font-medium truncate">{value}</p>
    </div>
  );
}
