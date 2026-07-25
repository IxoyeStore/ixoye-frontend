import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { answerText } = await request.json();
  const text = String(answerText || "").trim();
  if (!text) return NextResponse.json({ error: "La respuesta no puede estar vacía" }, { status: 400 });

  const res = await fetch(`${API}/api/questions/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { answerText: text, answeredAt: new Date().toISOString() } }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const res = await fetch(`${API}/api/questions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return NextResponse.json({ success: res.ok });
}
