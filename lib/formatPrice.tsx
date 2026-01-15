export function formatPrice(price: number) {
  const priceFormated = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });

  const finalPrice = priceFormated.format(price);

  return finalPrice;
}
