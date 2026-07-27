import { SITE_URL } from "@/lib/site";

const API = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 100;
const MAX_PAGES = 50; // safety cap (~5000 productos)

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchAllActiveProducts() {
  const products: any[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    const res = await fetch(
      `${API}/api/products?filters[active][$eq]=true` +
        `&populate[category][fields][0]=categoryName` +
        `&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) break;
    const json = await res.json();
    products.push(...(json.data || []));
    const pageCount = json.meta?.pagination?.pageCount || 1;
    if (page >= pageCount) break;
    page++;
  }

  return products;
}

function buildItem(product: any): string {
  const link = `${SITE_URL}/product/${product.slug}`;
  const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : "";
  const inStock = Number(product.stock) > 0;
  const brand = product.brand ? escapeXml(product.brand) : "";
  const description =
    product.description || `${product.productName} — Código: ${product.code}.`;

  return `
  <item>
    <g:id>${escapeXml(String(product.code))}</g:id>
    <title>${escapeXml(product.productName)}</title>
    <description>${escapeXml(description.slice(0, 5000))}</description>
    <link>${link}</link>
    ${image ? `<g:image_link>${escapeXml(image)}</g:image_link>` : ""}
    <g:condition>new</g:condition>
    <g:availability>${inStock ? "in stock" : "out of stock"}</g:availability>
    <g:price>${Number(product.price).toFixed(2)} MXN</g:price>
    ${brand ? `<g:brand>${brand}</g:brand>` : ""}
    ${product.oemCode ? `<g:mpn>${escapeXml(String(product.oemCode))}</g:mpn>` : ""}
    ${!brand || !product.oemCode ? "<g:identifier_exists>no</g:identifier_exists>" : ""}
    ${product.category?.categoryName ? `<g:product_type>${escapeXml(product.category.categoryName)}</g:product_type>` : ""}
  </item>`;
}

export async function GET() {
  const products = await fetchAllActiveProducts();
  const items = products.map(buildItem).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>Refacciones Ixoye — Catálogo</title>
  <link>${SITE_URL}</link>
  <description>Refacciones diésel y agrícolas para camión, tractor y maquinaria pesada.</description>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
