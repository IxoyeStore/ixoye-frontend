import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;
  if (!jwt) return NextResponse.json({ data: [] });

  const res = await fetch(`${API}/api/questions/mine`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ data: [] }, { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}
