import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, jwt, user } = body;

    let finalJwt = jwt;
    let finalUser = user;

    if (!finalJwt) {
      const res = await fetch(`${process.env.STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { error: data.error?.message || "Credenciales inválidas" },
          { status: 401 }
        );
      }

      finalJwt = data.jwt;
      finalUser = data.user;
    }

    const response = NextResponse.json({
      user: finalUser,
      jwt: finalJwt,
    });

    response.cookies.set("jwt", finalJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Error en API LOGIN:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
