import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);

  const documentIds = searchParams.get("documentIds");
  if (documentIds) {
    const ids = documentIds.split(",").filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ data: [] });
    const filterQs = ids.map((id, i) => `&filters[documentId][$in][${i}]=${encodeURIComponent(id)}`).join("");
    const res = await fetch(
      `${API}/api/products?pagination[pageSize]=${ids.length}${filterQs}`,
      { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data);
  }

  const page     = searchParams.get("page")     || "1";
  const pageSize = searchParams.get("pageSize") || "20";
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const active = searchParams.get("active");
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const stockStatus = searchParams.get("stockStatus") || "";
  const sort     = searchParams.get("sort") || "productName:asc";

  let url = `${API}/api/products?populate[category][fields][0]=categoryName&populate[category][fields][1]=slug&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  if (search) {
    url +=
      `&filters[$or][0][productName][$containsi]=${encodeURIComponent(search)}` +
      `&filters[$or][1][code][$containsi]=${encodeURIComponent(search)}` +
      `&filters[$or][2][brand][$containsi]=${encodeURIComponent(search)}` +
      `&filters[$or][3][oemCode][$containsi]=${encodeURIComponent(search)}`;
  }
  if (category === "__uncategorized__") url += `&filters[category][$null]=true`;
  else if (category) url += `&filters[category][slug][$eq]=${category}`;
  if (active !== null && active !== "") url += `&filters[active][$eq]=${active}`;
  if (priceMin) url += `&filters[price][$gte]=${priceMin}`;
  if (priceMax) url += `&filters[price][$lte]=${priceMax}`;
  if (stockStatus === "low") url += `&filters[stock][$gt]=0&filters[stock][$lte]=5`;
  else if (stockStatus === "out") url += `&filters[stock][$lte]=0`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const res = await fetch(`${API}/api/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: body }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
