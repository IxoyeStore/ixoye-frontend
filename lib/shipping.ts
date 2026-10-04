// Envio gratis en Nayarit solo a partir de este monto; por debajo se cobra
// la tarifa fija. Deben coincidir siempre con FREE_SHIPPING_MIN_TOTAL /
// SHIPPING_FLAT_COST en ixoye-backend/src/api/order/controllers/order.ts,
// que es quien realmente cobra.
export const FREE_SHIPPING_MIN_TOTAL = 999;
export const SHIPPING_FLAT_COST = 150;
