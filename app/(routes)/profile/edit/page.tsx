"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import PersonalDataSection from "./components/personal-data-section";
import AddressSection from "./components/address-section";

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");
  const isNewAddress = searchParams.get("new") === "true";
  const isAddressFocused = isNewAddress || !!addressId;

  const [hasAnyAddress, setHasAnyAddress] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user?.jwt) return;
    if (isAddressFocused) {
      // Ya sabemos a que direccion venimos a dar mantenimiento, no hace
      // falta esperar el conteo para decidir el estado inicial.
      setHasAnyAddress(true);
      return;
    }
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses?pagination[pageSize]=1`, {
      headers: { Authorization: `Bearer ${user.jwt}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setHasAnyAddress((json.meta?.pagination?.total ?? 0) > 0);
      })
      .catch(() => {
        if (!cancelled) setHasAnyAddress(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.jwt, isAddressFocused]);

  if (authLoading || !user || hasAnyAddress === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#0071b1]" />
      </div>
    );
  }

  const profileIncomplete =
    !user.profile?.firstName?.trim() ||
    !user.profile?.lastName?.trim() ||
    !user.profile?.phone?.trim();
  const addressMissing = hasAnyAddress === false;
  const needsSetup = profileIncomplete || addressMissing;

  return (
    <div className="flex justify-center items-center py-10 px-4 bg-gray-50/50 dark:bg-slate-900 min-h-[calc(100vh-80px)] text-black dark:text-white">
      <div className="w-full max-w-2xl space-y-4">
        <Link
          href="/profile"
          className="inline-flex items-center text-sm font-semibold text-[#0071b1] hover:text-[#012849] dark:text-sky-400 dark:hover:text-sky-300 group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1" />
          Volver al perfil
        </Link>

        <Card className="shadow-xl border-none ring-1 ring-gray-100 dark:ring-slate-700">
          <CardHeader className="text-center pt-8 border-b border-gray-100 dark:border-slate-700">
            <CardTitle className="text-3xl font-extrabold text-[#012849] dark:text-sky-300">
              Editar Perfil
            </CardTitle>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Edita solo lo que necesites, cada sección se guarda por separado.
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-8 py-8 space-y-4">
            {needsSetup && (
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30">
                <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Necesitas completar tus datos para comprar.
                </p>
              </div>
            )}

            <PersonalDataSection
              user={user}
              defaultExpanded={!isAddressFocused || profileIncomplete}
            />

            <AddressSection
              key={addressId || (isNewAddress ? "new" : "default")}
              user={user}
              addressId={addressId}
              isNewAddress={isNewAddress}
              defaultExpanded={isAddressFocused || addressMissing}
            />

            <div className="pt-2 border-t border-gray-100 dark:border-slate-700 text-center">
              <Link
                href="/profile/security"
                className="text-sm font-semibold text-[#0071b1] dark:text-sky-400 hover:text-[#012849] dark:hover:text-sky-300 hover:underline"
              >
                Cambiar contraseña
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
