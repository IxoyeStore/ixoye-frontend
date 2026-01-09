"use client";

import { useAuth } from "@/context/auth-context";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-xl font-semibold">Mis datos</h2>

      <p>Email: {user.email}</p>
      <p>Usuario: {user.username}</p>
    </div>
  );
}
