"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch(
        "https://ixoye-backend-production.up.railway.app/api/me",
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      if (data.user) {
        setUser({
          ...data.user,
          jwt: data.jwt,
          users_permissions_user: data.user.users_permissions_user || null,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error al refrescar usuario:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used dentro de AuthProvider");
  }
  return context;
}
