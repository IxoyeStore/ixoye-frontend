export type OrderForNotifications = {
  id: number;
  documentId?: string;
  orderStatus?: string;
  total?: number;
};

export type OrderStatusChange = {
  id: number;
  documentId?: string;
  orderStatus: string;
  total?: number;
};

/** Compara el estado actual de cada pedido contra el ultimo visto (por id)
 * y regresa los que cambiaron de estado desde entonces. */
export function detectStatusChanges(
  orders: OrderForNotifications[],
  lastSeen: Record<number, string>,
): OrderStatusChange[] {
  const changes: OrderStatusChange[] = [];
  for (const o of orders) {
    if (!o.orderStatus) continue;
    const prev = lastSeen[o.id];
    if (prev !== undefined && prev !== o.orderStatus) {
      changes.push({
        id: o.id,
        documentId: o.documentId,
        orderStatus: o.orderStatus,
        total: o.total,
      });
    }
  }
  return changes;
}

/** Construye el mapa {id: orderStatus} actual, para guardar como "ultimo visto". */
export function buildStatusMap(
  orders: OrderForNotifications[],
): Record<number, string> {
  const map: Record<number, string> = {};
  for (const o of orders) {
    if (o.orderStatus) map[o.id] = o.orderStatus;
  }
  return map;
}
