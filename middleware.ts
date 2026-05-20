import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const token   = request.cookies.get("jwt")?.value;
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage    = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProfilePage = pathname.startsWith("/profile");
  const isAdminPage   = pathname.startsWith("/admin");

  if (isAdminPage) {
    if (!token || !session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = await verifySignedSession(session);
    if (role !== "Admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (!token && isProfilePage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/admin", "/login", "/register"],
};
