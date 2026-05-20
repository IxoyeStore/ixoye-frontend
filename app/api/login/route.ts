import { NextResponse } from "next/server";
import { createSignedSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, jwt, user } = body;

    let finalJwt = jwt;
    let finalUser = user;

    if (!finalJwt) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { error: data.error?.message || "Credenciales inválidas" },
          { status: 401 },
        );
      }

      finalJwt = data.jwt;
      finalUser = data.user;
    }

    // Strapi v5 login response does not populate role — fetch it separately.
    const meRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me?populate=role`,
      { headers: { Authorization: `Bearer ${finalJwt}` }, cache: "no-store" },
    );
    const meData = meRes.ok ? await meRes.json() : null;
    const roleName: string = meData?.role?.name ?? "Authenticated";

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    };

    const sessionToken = await createSignedSession(roleName);

    const response = NextResponse.json({
      user: finalUser,
      jwt: finalJwt,
    });

    response.cookies.set("jwt", finalJwt, cookieOptions);
    response.cookies.set("session", sessionToken, cookieOptions);

    return response;
  } catch (error) {
    console.error("Error en API LOGIN:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
