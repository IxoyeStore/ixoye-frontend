"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

// Exportado para que el login (que ya manda al Admin directo a /admin al
// autenticarse) marque la misma bandera - si no, al hacer clic despues en
// "Ir a la Tienda" este hook lo rebotaria de vuelta a /admin de inmediato.
export const ADMIN_AUTO_REDIRECT_FLAG = "ixoye_admin_auto_redirected";

// Comodidad para que un Admin no tenga que navegar a /admin a mano cada
// vez que abre el sitio o la app movil - se dispara UNA sola vez por
// sesion de navegador/app (sessionStorage, no localStorage: al cerrar y
// volver a abrir la app debe disparar de nuevo, pero no debe interrumpir
// si el propio admin ya eligio "Ir a la Tienda" durante esta sesion).
//
// Esto es solo una comodidad de navegacion, NO el limite de seguridad: el
// rol viene de user.role (poblado server-side via /api/users/me en
// context/auth-context.tsx), y aunque alguien manipulara el estado del
// cliente para forzar el redirect, no ganaria acceso real a nada - cada
// ruta /api/admin/* revalida el rol contra Strapi con getAdminJwt(), y el
// layout de /admin hace lo mismo antes de mostrar cualquier dato.
export function useAdminAutoRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role?.name !== "Admin") return;
    if (sessionStorage.getItem(ADMIN_AUTO_REDIRECT_FLAG)) return;

    sessionStorage.setItem(ADMIN_AUTO_REDIRECT_FLAG, "1");
    router.replace("/admin");
  }, [user, loading, router]);
}
