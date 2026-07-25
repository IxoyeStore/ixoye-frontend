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
  if (!field) return { productId, event, ok: false, reason: "unknown-event" };

  const findRes = await fetch(
    `${API}/api/product-metrics?filters[productId][$eq]=${productId}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" }
  );
  if (!findRes.ok) {
    const detail = await findRes.text();
    console.error(`[metrics] find failed for product ${productId}: ${findRes.status} ${detail}`);
    return { productId, event, ok: false, reason: `find:${findRes.status}` };
  }
  const findData = await findRes.json();
  const existing = findData.data?.[0];

  const writeRes = existing
    ? await fetch(`${API}/api/product-metrics/${existing.documentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ data: { [field]: (existing[field] ?? 0) + 1 } }),
      })
    : await fetch(`${API}/api/product-metrics`, {
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

  if (!writeRes.ok) {
    const detail = await writeRes.text();
    console.error(`[metrics] write failed for product ${productId}: ${writeRes.status} ${detail}`);
    return { productId, event, ok: false, reason: `write:${writeRes.status}` };
  }

  return { productId, event, ok: true };
}

export async function POST(request: NextRequest) {
  if (!API || !TOKEN) return NextResponse.json({ ok: false, reason: "missing-env" });

  const body = await request.json();

  // Batch: { events: [{ productId, event }, ...] }
  // Single: { productId, event }
  const events: { productId: number; event: string }[] = body.events
    ? body.events
    : [{ productId: body.productId, event: body.event }];

  const valid = events.filter(({ productId, event }) => productId && FIELD[event]);
  const results = await Promise.all(valid.map(({ productId, event }) => trackOne(productId, event)));

  return NextResponse.json({ ok: results.every((r) => r.ok), results });
}
