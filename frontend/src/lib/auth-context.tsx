"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { User } from "./types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  refreshUser: () => Promise<User | null>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshUser = useCallback(async () => {
    try {
      const result = await api<{ user: User | null }>("/auth/me", { skipAuthRedirect: true });
      setUser(result.user);
      setStatus(result.user ? "authenticated" : "unauthenticated");
      return result.user;
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (user) await api("/auth/logout", { method: "POST", skipAuthRedirect: true });
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    api<{ user: User | null }>("/auth/me", { skipAuthRedirect: true })
      .then(({ user: current }) => {
        if (!active) return;
        setUser(current);
        setStatus(current ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      });
    const unauthorized = () => {
      setUser(null);
      setStatus("unauthenticated");
    };
    window.addEventListener("workx:unauthorized", unauthorized);
    return () => {
      active = false;
      window.removeEventListener("workx:unauthorized", unauthorized);
    };
  }, []);

  const value = useMemo(() => ({ user, status, refreshUser, signOut }), [user, status, refreshUser, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
