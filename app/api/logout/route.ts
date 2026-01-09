import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("jwt");

    const response = NextResponse.json({ success: true });

    response.cookies.set("jwt", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Error en el logout:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
