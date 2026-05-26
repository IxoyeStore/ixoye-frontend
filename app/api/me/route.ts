import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;

  if (!jwt) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me?populate=role`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
      },
    );

    if (!userRes.ok) return NextResponse.json({ user: null }, { status: 401 });
    const userData = await userRes.json();

    const profileRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles?filters[users_permissions_user][id][$eq]=${userData.id}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
      },
    );

    let profile = null;
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      profile = profileData.data?.[0] ?? null;
    }

    return NextResponse.json({
      user: {
        ...userData,
        jwt,
        profile,
      },
    });
  } catch (error) {
    console.error("Error en api/me:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
