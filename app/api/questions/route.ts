import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  if (!product) return NextResponse.json({ error: "Falta el producto" }, { status: 400 });

  const url =
    `${API}/api/questions?filters[product][documentId][$eq]=${encodeURIComponent(product)}` +
    `&sort=createdAt:desc&pagination[page]=1&pagination[pageSize]=3` +
    `&fields[0]=questionText&fields[1]=answerText&fields[2]=createdAt&fields[3]=answeredAt`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;
  if (!jwt) return NextResponse.json({ error: "Debes iniciar sesión para preguntar." }, { status: 401 });

  const body = await request.json();
  const { questionText, product, website } = body;

  const res = await fetch(`${API}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ data: { questionText, product, website } }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message || "Error al enviar la pregunta" }, { status: res.status });
  }
  return NextResponse.json(data);
}
