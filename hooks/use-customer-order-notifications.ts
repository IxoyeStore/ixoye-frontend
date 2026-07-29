"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import {
  detectStatusChanges,
  buildStatusMap,
  type OrderStatusChange,
} from "@/lib/customer-order-notifications-utils";

const POLL_MS = 30_000;
const LS_KEY_PREFIX = "ixoye_customer_last_order_status_";

export function useCustomerOrderNotifications() {
  const { user } = useAuth();
  const [changes, setChanges] = useState<OrderStatusChange[]>([]);
  const lsKey = user ? `${LS_KEY_PREFIX}${user.id}` : null;

  const poll = useCallback(async () => {
    if (!lsKey || !user?.jwt) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${user.jwt}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const orders = data.data || [];
      if (orders.length === 0) return;

      const currentMap = buildStatusMap(orders);
      // "Ya vimos pedidos de este usuario en este navegador antes?" se basa
      // en si hay algo guardado en localStorage, NO en un ref del hook: un
      // ref se reinicia en cada montaje (incluida cualquier recarga completa
      // de la pagina), lo que causaba que se saltara la deteccion justo
      // despues de refrescar el navegador.
      const storedRaw = localStorage.getItem(lsKey);

      if (!storedRaw) {
        localStorage.setItem(lsKey, JSON.stringify(currentMap));
        return;
      }

      const storedMap: Record<number, string> = JSON.parse(storedRaw);
      const fresh = detectStatusChanges(orders, storedMap);
      localStorage.setItem(lsKey, JSON.stringify(currentMap));
      if (fresh.length === 0) return;

      setChanges((prev) => [...fresh, ...prev]);
    } catch {
      // silently ignore network errors
    }
  }, [lsKey, user?.jwt]);

  useEffect(() => {
    setChanges([]);
    if (!lsKey) return;
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [lsKey, poll]);

  const clearNotifications = useCallback(() => setChanges([]), []);

  const removeChange = useCallback(
    (id: number) => setChanges((prev) => prev.filter((c) => c.id !== id)),
    [],
  );

  return {
    orderChanges: changes,
    newOrderCount: changes.length,
    clearNotifications,
    removeChange,
  };
}
