import { cookies } from "next/headers";

export async function getAdminJwt(): Promise<string | null> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;
  if (!jwt) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/me?populate=role`,
    { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }
  );

  if (!res.ok) return null;
  const user = await res.json();

  if (user.role?.name !== "Admin") return null;
  return jwt;
}
