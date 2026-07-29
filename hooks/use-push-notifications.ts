"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { useAuth } from "@/context/auth-context";

// Solo tiene sentido dentro de la app nativa (Capacitor); en el navegador
// normal @capacitor/push-notifications no tiene a que conectarse. Se
// registra el token del dispositivo contra el usuario en sesion para que
// el backend sepa a donde mandar el push, y se navega al pedido
// correspondiente cuando el cliente toca la notificacion.
export function usePushNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const registeredToken = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user?.jwt) return;

    let cancelled = false;

    const sendToken = async (token: string) => {
      if (registeredToken.current === token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/device-tokens/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.jwt}`,
            },
            body: JSON.stringify({ data: { token, platform: "android" } }),
          },
        );
        if (res.ok) registeredToken.current = token;
      } catch {
        // Sin conexion o backend caido: no es critico, se reintenta en el
        // siguiente montaje (login, reabrir la app, etc.).
      }
    };

    const setup = async () => {
      const perm = await PushNotifications.checkPermissions();
      let status = perm.receive;
      if (status === "prompt" || status === "prompt-with-rationale") {
        const req = await PushNotifications.requestPermissions();
        status = req.receive;
      }
      if (status !== "granted" || cancelled) return;

      await PushNotifications.register();
    };

    const registrationListener = PushNotifications.addListener(
      "registration",
      (token) => sendToken(token.value),
    );

    const errorListener = PushNotifications.addListener(
      "registrationError",
      (err) => console.error("Push registration error:", err),
    );

    // Al tocar la notificacion (app en segundo plano o cerrada), se manda
    // directo al detalle del pedido segun el rol.
    const actionListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        const data = action.notification.data || {};
        if (data.type === "order_status" && data.orderDocumentId) {
          router.push(`/profile/orders/${data.orderDocumentId}`);
        } else if (data.type === "new_order" && data.orderDocumentId) {
          router.push(`/admin/orders/${data.orderDocumentId}`);
        }
      },
    );

    setup();

    return () => {
      cancelled = true;
      registrationListener.then((l) => l.remove());
      errorListener.then((l) => l.remove());
      actionListener.then((l) => l.remove());
    };
  }, [user?.jwt, router]);
}
