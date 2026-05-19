export type NotificationOrder = {
  id: number;
  documentId?: string;
  createdAt?: string;
  user?: { username?: string };
};

/** Returns orders whose createdAt is strictly after baseTimestamp (ms). */
export function detectNewOrders(orders: NotificationOrder[], baseTimestamp: number): NotificationOrder[] {
  return orders.filter((o) => o.createdAt && new Date(o.createdAt).getTime() > baseTimestamp);
}

/** Builds the admin detail URL for an order, preferring documentId over numeric id. */
export function getOrderHref(order: Pick<NotificationOrder, "id" | "documentId">): string {
  return `/admin/orders/${order.documentId ?? order.id}`;
}

/** Returns the latest createdAt timestamp (ms) across a list of orders, or 0. */
export function getLatestTimestamp(orders: NotificationOrder[]): number {
  if (orders.length === 0) return 0;
  return Math.max(...orders.map((o) => (o.createdAt ? new Date(o.createdAt).getTime() : 0)));
}
