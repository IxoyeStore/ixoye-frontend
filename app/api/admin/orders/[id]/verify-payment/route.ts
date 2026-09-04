import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const res = await fetch(`${API}/api/orders/${id}/verify-payment`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("[admin/orders/[id]/verify-payment] Strapi error:", res.status, data);
  }
  return NextResponse.json(data, { status: res.status });
}
