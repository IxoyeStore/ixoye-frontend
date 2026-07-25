import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page     = searchParams.get("page")     || "1";
  const pageSize = searchParams.get("pageSize") || "20";
  const status   = searchParams.get("status")   || "pending"; // pending | answered | all

  let url =
    `${API}/api/questions?sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
    `&populate[product][fields][0]=productName&populate[product][fields][1]=code&populate[product][fields][2]=slug` +
    `&populate[user][fields][0]=username&populate[user][fields][1]=email`;

  if (status === "pending") url += `&filters[answerText][$null]=true`;
  if (status === "answered") url += `&filters[answerText][$notNull]=true`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
