import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;

  if (!jwt) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const userRes = await fetch(
      `https://ixoye-backend-production.up.railway.app/api/users/me`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
      },
    );

    if (!userRes.ok) return NextResponse.json({ user: null }, { status: 401 });
    const userData = await userRes.json();

    const profileUrl = `https://ixoye-backend-production.up.railway.app/api/profiles?filters[users_permissions_user][id][$eq]=${userData.id}`;

    const profileRes = await fetch(profileUrl, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    });

    const profileData = await profileRes.json();

    const userProfile =
      profileData.data && profileData.data.length > 0
        ? profileData.data[0]
        : null;

    const profileContent = userProfile?.attributes
      ? { id: userProfile.id, ...userProfile.attributes }
      : userProfile;

    return NextResponse.json({
      user: {
        ...userData,
        jwt: jwt,
        profile: profileContent,
      },
      jwt: jwt,
    });
  } catch (error) {
    console.error("Error en api/me:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
