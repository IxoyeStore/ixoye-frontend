import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;

  if (!jwt) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const userRes = await fetch(`${process.env.STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    });

    if (!userRes.ok) return NextResponse.json({ user: null }, { status: 401 });
    const userData = await userRes.json();

    const profileUrl = `${process.env.STRAPI_URL}/api/profiles?filters[users_permissions_user][id][$eq]=${userData.id}`;

    const profileRes = await fetch(profileUrl, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    });

    const profileData = await profileRes.json();

    const userProfile =
      profileData.data && profileData.data.length > 0
        ? profileData.data[0]
        : null;

    console.log(
      `> Perfil cargado para: ${userData.username} | ¿Existe?: ${
        userProfile ? "SÍ" : "NO"
      }`
    );

    return NextResponse.json({
      user: {
        ...userData,
        jwt: jwt,
        users_permissions_user: userProfile,
      },
      jwt: jwt,
    });
  } catch (error) {
    console.error("Error en api/me:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
