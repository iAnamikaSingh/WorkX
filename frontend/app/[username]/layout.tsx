"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { username } = useParams<{ username: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [verifiedFor, setVerifiedFor] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    setChecking(true);
    setVerifiedFor(null);
    api<{ user: User | null }>("/auth/me")
      .then(({ user }) => {
        if (!active) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        if (user.username !== username) {
          const suffix = pathname.slice(("/" + username).length);
          router.replace("/" + encodeURIComponent(user.username) + suffix);
          return;
        }
        setVerifiedFor(username);
        setChecking(false);
      })
      .catch(() => {
        if (active) router.replace("/login");
      });
    return () => { active = false; };
  }, [username, pathname, router]);

  useEffect(() => {
    const handleUnauthorized = () => router.replace("/login");
    window.addEventListener("workx:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("workx:unauthorized", handleUnauthorized);
  }, [router]);

  if (checking || verifiedFor !== username) {
    return <main className="shell" aria-live="polite"><p className="loading">Verifying your workspace…</p></main>;
  }
  return <>{children}</>;
}
