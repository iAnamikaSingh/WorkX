"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type CurrentUser = { username: string } | null;

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { username } = useParams<{ username: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let active = true;
    api<{ user: CurrentUser }>("/auth/me")
      .then(({ user }) => {
        if (!active) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        if (user.username !== username) {
          const suffix = pathname.slice(("/" + username).length);
          router.replace("/" + user.username + suffix);
          return;
        }
        setVerified(true);
      })
      .catch(() => router.replace("/login"));
    return () => { active = false; };
  }, [username, pathname, router]);

  if (!verified) return <main className="shell"><p className="loading">Verifying your workspace…</p></main>;
  return <>{children}</>;
}
