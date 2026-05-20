import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("jwt");
    cookieStore.delete("session");

    const response = NextResponse.json({ success: true });

    const expiredCookie = { path: "/", maxAge: 0, expires: new Date(0) };
    response.cookies.set("jwt", "", expiredCookie);
    response.cookies.set("session", "", expiredCookie);

    return response;
  } catch (error) {
    console.error("Error en el logout:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
