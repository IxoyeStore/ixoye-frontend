import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getJwtAndUserId(): Promise<{ jwt: string; userId: number } | null> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;
  if (!jwt) return null;

  const res = await fetch(`${API}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { jwt, userId: data.id };
}

export async function PUT(req: NextRequest) {
  const auth = await getJwtAndUserId();
  if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { jwt, userId } = auth;
  const body = await req.json();
  const { documentId, ...fields } = body;

  if (documentId) {
    const res = await fetch(`${API}/api/profiles/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ data: fields }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || "Error al actualizar perfil" }, { status: res.status });
    return NextResponse.json(data);
  } else {
    const res = await fetch(`${API}/api/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ data: { ...fields, users_permissions_user: userId } }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || "Error al crear perfil" }, { status: res.status });
    return NextResponse.json(data);
  }
}
