import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt");

  if (!jwt) {
    redirect("/login");
  }

  return <>{children}</>;
}
