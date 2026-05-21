import { NextRequest, NextResponse } from "next/server";

const API   = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = process.env.STRAPI_TOKEN;

const FIELD: Record<string, string> = {
  view:                "views",
  cart:                "cartAdds",
  purchase:            "purchases",
  searchImpression:    "searchImpressions",
  categoryImpression:  "categoryImpressions",
};

async function trackOne(productId: number, event: string) {
  const field = FIELD[event];
  if (!field) return;

  const findRes = await fetch(
    `${API}/api/product-metrics?filters[productId][$eq]=${productId}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" }
  );
  const findData = await findRes.json();
  const existing = findData.data?.[0];

  if (existing) {
    const current = existing[field] ?? 0;
    await fetch(`${API}/api/product-metrics/${existing.documentId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: { [field]: current + 1 } }),
    });
  } else {
    await fetch(`${API}/api/product-metrics`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          productId,
          views: 0, cartAdds: 0, purchases: 0,
          searchImpressions: 0, categoryImpressions: 0,
          [field]: 1,
        },
      }),
    });
  }
}

export async function POST(request: NextRequest) {
  if (!API || !TOKEN) return NextResponse.json({ ok: false });

  const body = await request.json();

  // Batch: { events: [{ productId, event }, ...] }
  // Single: { productId, event }
  const events: { productId: number; event: string }[] = body.events
    ? body.events
    : [{ productId: body.productId, event: body.event }];

  const valid = events.filter(({ productId, event }) => productId && FIELD[event]);
  await Promise.all(valid.map(({ productId, event }) => trackOne(productId, event)));

  return NextResponse.json({ ok: true });
}
