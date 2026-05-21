import { NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API   = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = process.env.STRAPI_TOKEN;

export async function GET() {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (!API || !TOKEN) return NextResponse.json({});

  const res = await fetch(
    `${API}/api/product-metrics?pagination[pageSize]=2000`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" }
  );
  const data = await res.json();

  const map: Record<number, { views: number; cartAdds: number; purchases: number; searchImpressions: number; categoryImpressions: number }> = {};
  for (const item of data.data ?? []) {
    map[item.productId] = {
      views:                item.views                ?? 0,
      cartAdds:             item.cartAdds             ?? 0,
      purchases:            item.purchases            ?? 0,
      searchImpressions:    item.searchImpressions    ?? 0,
      categoryImpressions:  item.categoryImpressions  ?? 0,
    };
  }

  return NextResponse.json(map);
}
