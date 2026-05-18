import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = searchParams.get("page") || "1";

  let url = `${API}/api/orders?populate[user][fields][0]=username&populate[user][fields][1]=email&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=20`;
  if (status) url += `&filters[orderStatus][$eq]=${status}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data);
}
