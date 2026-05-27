import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(req: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { documentId, userId, ...fields } = body;

  if (documentId) {
    const res = await fetch(`${API}/api/profiles/${documentId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: fields }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } else {
    const res = await fetch(`${API}/api/profiles`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: { ...fields, users_permissions_user: userId } }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
}
