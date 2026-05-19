import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ data: null });

  const url = `${API}/api/addresses?filters[users_permissions_user][id][$eq]=${userId}&sort=isDefault:desc&pagination[pageSize]=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });

  const json = await res.json();
  // Return raw Strapi response so the client can log it
  return NextResponse.json({ _status: res.status, _url: url, _raw: json });
}
