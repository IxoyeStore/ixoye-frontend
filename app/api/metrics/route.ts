import { NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API   = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = process.env.STRAPI_TOKEN;

export async function GET() {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (!API || !TOKEN) return NextResponse.json({});

  const map: Record<number, { views: number; cartAdds: number; purchases: number; searchImpressions: number; categoryImpressions: number }> = {};

  let page = 1;
  const PAGE_SIZE = 100;

  while (true) {
    const res = await fetch(
      `${API}/api/product-metrics?pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`,
      { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" }
    );
    const data = await res.json();
    const items: any[] = data.data ?? [];

    for (const item of items) {
      map[item.productId] = {
        views:               item.views               ?? 0,
        cartAdds:            item.cartAdds            ?? 0,
        purchases:           item.purchases           ?? 0,
        searchImpressions:   item.searchImpressions   ?? 0,
        categoryImpressions: item.categoryImpressions ?? 0,
      };
    }

    const { pageCount } = data.meta?.pagination ?? {};
    if (!pageCount || page >= pageCount) break;
    page++;
  }

  return NextResponse.json(map);
}
