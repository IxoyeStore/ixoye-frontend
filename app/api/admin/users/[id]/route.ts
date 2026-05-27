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

  const [userRes, profileRes, addressRes, rolesRes] = await Promise.all([
    fetch(`${API}/api/users/${id}?populate=role`, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }),
    fetch(`${API}/api/profiles?filters[users_permissions_user][id][$eq]=${id}`, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }),
    fetch(`${API}/api/addresses?filters[users_permissions_user][id][$eq]=${id}&sort=isDefault:desc&pagination[pageSize]=20`, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }),
    fetch(`${API}/api/users-permissions/roles`, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }),
  ]);

  const user = await userRes.json();
  const profileJson = profileRes.ok ? await profileRes.json() : { data: [] };
  const addressJson = addressRes.ok ? await addressRes.json() : { data: [] };
  const rolesJson = rolesRes.ok ? await rolesRes.json() : { roles: [] };

  return NextResponse.json({
    user,
    profile: profileJson.data?.[0] ?? null,
    addresses: addressJson.data ?? [],
    roles: (rolesJson.roles ?? []).filter((r: any) => r.type !== "public"),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const res = await fetch(`${API}/api/users/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

  const res = await fetch(`${API}/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return NextResponse.json({ success: res.ok });
}
