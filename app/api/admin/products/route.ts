import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page     = searchParams.get("page")     || "1";
  const pageSize = searchParams.get("pageSize") || "20";
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const active = searchParams.get("active");
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";

  let url = `${API}/api/products?populate[category][fields][0]=categoryName&populate[category][fields][1]=slug&sort=productName:asc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
  if (search) url += `&filters[$or][0][productName][$containsi]=${encodeURIComponent(search)}&filters[$or][1][code][$containsi]=${encodeURIComponent(search)}`;
  if (category) url += `&filters[category][slug][$eq]=${category}`;
  if (active !== null && active !== "") url += `&filters[active][$eq]=${active}`;
  if (priceMin) url += `&filters[price][$gte]=${priceMin}`;
  if (priceMax) url += `&filters[price][$lte]=${priceMax}`;

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
