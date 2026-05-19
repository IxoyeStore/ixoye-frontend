import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const res = await fetch(
    `${API}/api/orders/${id}?populate[user][fields][0]=id&populate[user][fields][1]=username&populate[user][fields][2]=email`,
    { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("[admin/orders/[id]] Strapi error:", res.status, data);
  }
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const res = await fetch(`${API}/api/orders/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: body }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
