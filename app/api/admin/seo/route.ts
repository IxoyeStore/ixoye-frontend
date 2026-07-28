import { NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";
import { SITE_URL } from "@/lib/site";

const API = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = process.env.STRAPI_TOKEN;

async function countProducts(jwt: string, extraFilters: string): Promise<number> {
  const res = await fetch(
    `${API}/api/products?filters[active][$eq]=true${extraFilters}&pagination[pageSize]=1`,
    { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" },
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.meta?.pagination?.total ?? 0;
}

async function fetchAllMetrics(): Promise<any[]> {
  if (!API || !TOKEN) return [];
  const all: any[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${API}/api/product-metrics?pagination[page]=${page}&pagination[pageSize]=100`,
      { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
    );
    if (!res.ok) break;
    const data = await res.json();
    all.push(...(data.data ?? []));
    const pageCount = data.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page++;
  }
  return all;
}

async function checkUrl(path: string, countPattern?: RegExp) {
  try {
    const res = await fetch(`${SITE_URL}${path}`, { cache: "no-store" });
    const text = countPattern ? await res.text() : "";
    const count = countPattern ? (text.match(countPattern) || []).length : null;
    return { ok: res.ok, count };
  } catch {
    return { ok: false, count: null };
  }
}

export async function GET() {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const [totalActive, withoutCategory, withoutDescription, withoutOemCode] =
    await Promise.all([
      countProducts(jwt, ""),
      countProducts(jwt, "&filters[category][$null]=true"),
      countProducts(jwt, "&filters[description][$eq]="),
      countProducts(jwt, "&filters[oemCode][$null]=true"),
    ]);

  const metrics = await fetchAllMetrics();

  const totals = metrics.reduce(
    (acc, m) => {
      acc.views += m.views ?? 0;
      acc.cartAdds += m.cartAdds ?? 0;
      acc.purchases += m.purchases ?? 0;
      acc.searchImpressions += m.searchImpressions ?? 0;
      acc.categoryImpressions += m.categoryImpressions ?? 0;
      return acc;
    },
    { views: 0, cartAdds: 0, purchases: 0, searchImpressions: 0, categoryImpressions: 0 },
  );

  const foundInSearchCount = metrics.filter((m) => (m.searchImpressions ?? 0) > 0).length;
  const neverFoundInSearch = Math.max(0, totalActive - foundInSearchCount);

  const topSearched = [...metrics]
    .filter((m) => (m.searchImpressions ?? 0) > 0)
    .sort((a, b) => (b.searchImpressions ?? 0) - (a.searchImpressions ?? 0))
    .slice(0, 5);

  let topSearchedWithNames: { productId: number; productName: string; searchImpressions: number }[] = [];
  if (topSearched.length > 0) {
    const idFilters = topSearched
      .map((m, i) => `&filters[id][$in][${i}]=${m.productId}`)
      .join("");
    const res = await fetch(
      `${API}/api/products?fields[0]=productName&fields[1]=id${idFilters}&pagination[pageSize]=${topSearched.length}`,
      { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" },
    );
    const data = res.ok ? await res.json() : { data: [] };
    const nameById = new Map((data.data ?? []).map((p: any) => [p.id, p.productName]));
    topSearchedWithNames = topSearched.map((m) => ({
      productId: m.productId,
      productName: (nameById.get(m.productId) as string) || `Producto #${m.productId}`,
      searchImpressions: m.searchImpressions ?? 0,
    }));
  }

  const [sitemap, robots, feed] = await Promise.all([
    checkUrl("/sitemap.xml", /<loc>/g),
    checkUrl("/robots.txt"),
    checkUrl("/feed/google-shopping.xml", /<g:id>/g),
  ]);

  return NextResponse.json({
    content: { totalActive, withoutCategory, withoutDescription, withoutOemCode },
    visibility: {
      trackedProducts: metrics.length,
      foundInSearchCount,
      neverFoundInSearch,
      totals,
      topSearched: topSearchedWithNames,
    },
    technical: { sitemap, robots, feed },
  });
}
