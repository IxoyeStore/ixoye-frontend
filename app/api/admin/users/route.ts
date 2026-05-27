import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  const search = searchParams.get("search") || "";

  let url = `${API}/api/users?populate=role&pagination[start]=${start}&pagination[limit]=${pageSize}&sort=createdAt:desc`;
  if (search) url += `&filters[$or][0][username][$containsi]=${encodeURIComponent(search)}&filters[$or][1][email][$containsi]=${encodeURIComponent(search)}`;

  const [usersRes, countRes] = await Promise.all([
    fetch(url, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }),
    fetch(`${API}/api/users/count`, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }),
  ]);

  const users: any[] = await usersRes.json();
  const count = await countRes.json();

  // Fetch profiles for this page of users in one call
  let profileMap: Record<number, string> = {};
  if (Array.isArray(users) && users.length > 0) {
    const ids = users.map((u) => u.id);
    const profileFilter = ids.map((id, i) => `filters[users_permissions_user][id][$in][${i}]=${id}`).join("&");
    const profilesRes = await fetch(
      `${API}/api/profiles?${profileFilter}&fields[0]=type&populate[users_permissions_user][fields][0]=id&pagination[pageSize]=${ids.length}`,
      { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }
    );
    if (profilesRes.ok) {
      const profilesJson = await profilesRes.json();
      for (const p of profilesJson.data ?? []) {
        const uid = p.users_permissions_user?.id ?? p.users_permissions_user?.data?.id;
        if (uid) profileMap[uid] = p.type;
      }
    }
  }

  const enriched = Array.isArray(users)
    ? users.map((u) => ({ ...u, profileType: profileMap[u.id] ?? null }))
    : users;

  return NextResponse.json({ data: enriched, meta: { total: count, page, pageSize } });
}
