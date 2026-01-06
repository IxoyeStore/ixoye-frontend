"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: any | null;
  jwt: string | null;
  isAuthenticated: boolean;
  login: (jwt: string, user: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔄 Restaurar sesión
  useEffect(() => {
    const storedJwt = localStorage.getItem("jwt");
    const storedUser = localStorage.getItem("user");

    if (storedJwt && storedUser) {
      setJwt(storedJwt);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = (jwt: string, user: any) => {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", JSON.stringify(user));

    setJwt(jwt);
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");

    setJwt(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return null; // o loader
  }

  return (
    <AuthContext.Provider value={{ user, jwt, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
