"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
  const { logout } = useAuth();

  return (
    <Button variant="destructive" onClick={logout}>
      Cerrar sesión
    </Button>
  );
}
