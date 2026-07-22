import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

async function verifyTurnstile(token: string, remoteIp: string | null) {
  const params = new URLSearchParams();
  params.set("secret", process.env.TURNSTILE_SECRET_KEY!);
  params.set("response", token);
  if (remoteIp) params.set("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, turnstileToken } = body;

    if (!turnstileToken) {
      return NextResponse.json({ error: { message: "Verificación de seguridad requerida" } }, { status: 400 });
    }

    const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const captchaOk = await verifyTurnstile(turnstileToken, remoteIp);
    if (!captchaOk) {
      return NextResponse.json({ error: { message: "No se pudo verificar que eres humano. Intenta de nuevo." } }, { status: 400 });
    }

    const res = await fetch(`${API}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: { message: "Error en el servidor" } }, { status: 500 });
  }
}
