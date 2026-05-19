"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { detectNewOrders, getLatestTimestamp, type NotificationOrder } from "@/lib/order-notifications-utils";

const POLL_MS = 30_000;
const LS_KEY = "ixoye_admin_last_order_ts";

export function useOrderNotifications() {
  const [newOrders, setNewOrders] = useState<NotificationOrder[]>([]);
  const initialized = useRef(false);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders?page=1");
      if (!res.ok) return;
      const data = await res.json();
      const orders: NotificationOrder[] = data.data || [];
      if (orders.length === 0) return;

      const latestTs = getLatestTimestamp(orders);
      const storedTs = parseInt(localStorage.getItem(LS_KEY) || "0", 10);

      if (!initialized.current) {
        initialized.current = true;
        if (!storedTs) localStorage.setItem(LS_KEY, String(latestTs));
        return;
      }

      const baseTs = storedTs || latestTs;
      const fresh = detectNewOrders(orders, baseTs);
      if (fresh.length === 0) return;

      localStorage.setItem(LS_KEY, String(latestTs));
      setNewOrders((prev) => [...fresh, ...prev]);

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const title = fresh.length === 1 ? "Nuevo pedido recibido" : `${fresh.length} nuevos pedidos`;
        const body =
          fresh.length === 1
            ? `Pedido #${fresh[0].id} — ${fresh[0].user?.username || "Cliente"}`
            : `${fresh.length} nuevos pedidos en Ixoye`;
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    } catch {
      // silently ignore network errors
    }
  }, []);

  useEffect(() => {
    requestPermission();
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [poll, requestPermission]);

  const clearNotifications = useCallback(() => setNewOrders([]), []);

  const removeOrder = useCallback(
    (id: number) => setNewOrders((prev) => prev.filter((o) => o.id !== id)),
    []
  );


  return { newOrders, newCount: newOrders.length, clearNotifications, removeOrder };
}
