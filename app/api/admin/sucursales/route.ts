import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const res = await fetch(
    `${API}/api/sucursales?sort=name:asc&pagination[pageSize]=100`,
    { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const res = await fetch(`${API}/api/sucursales`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: body }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
