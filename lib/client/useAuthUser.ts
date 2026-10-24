"use client";

import { useCallback, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "ADMIN" | "CUSTOMER";
}

export type AuthStatus = "loading" | "guest" | "authenticated";

/**
 * Client-side session lookup backed by /api/auth/me.
 * Re-checks whenever `deps` change (e.g. pathname).
 */
export function useAuthUser(deps: unknown[] = []) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        setStatus("guest");
        return null;
      }
      const data = await res.json();
      const nextUser: AuthUser | null = data?.user ?? null;
      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "guest");
      return nextUser;
    } catch {
      setUser(null);
      setStatus("guest");
      return null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, ...deps]);

  return { user, status, refresh };
}
