"use client";

import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import PersonalDataSection from "./components/personal-data-section";
import AddressSection from "./components/address-section";

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");
  const isNewAddress = searchParams.get("new") === "true";
  const isAddressFocused = isNewAddress || !!addressId;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#0071b1]" />
      </div>
    );
  }

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
            <PersonalDataSection user={user} defaultExpanded={!isAddressFocused} />

            <AddressSection
              key={addressId || (isNewAddress ? "new" : "default")}
              user={user}
              addressId={addressId}
              isNewAddress={isNewAddress}
              defaultExpanded={isAddressFocused}
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
