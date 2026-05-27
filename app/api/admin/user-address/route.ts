import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ data: [] });

  const url = `${API}/api/addresses?filters[users_permissions_user][id][$eq]=${userId}&sort=isDefault:desc&pagination[pageSize]=20`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" });
  const json = await res.json();
  return NextResponse.json({ data: json.data ?? [] });
}

export async function POST(req: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { userId, ...fields } = body;

  const res = await fetch(`${API}/api/addresses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { ...fields, users_permissions_user: userId } }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
