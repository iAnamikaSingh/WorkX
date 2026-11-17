"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Dashboard from "../dashboard/page";
import AccountSettings from "../account/page";
import Productivity from "../productivity/page";

type SessionUser = { username: string } | null;

export default function UserWorkspaceRoute() {
  const params = useParams<{ username: string; segments?: string[] }>();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "redirecting">("checking");
  const username = params.username;
  const segments = params.segments ?? [];
  const route = segments.join("/");

  useEffect(() => {
    let active = true;
    api<{ user: SessionUser }>("/auth/me")
      .then(({ user }) => {
        if (!active) return;
        if (!user) {
          router.replace("/login");
          return;
        }
        if (user.username !== username) {
          const destination = [user.username, ...segments].join("/");
          setStatus("redirecting");
          router.replace("/" + destination);
          return;
        }
        setStatus("allowed");
      })
      .catch(() => {
        if (active) router.replace("/login");
      });
    return () => { active = false; };
  }, [router, username, route]);

  if (status !== "allowed") {
    return <main className="shell"><p className="loading">{status === "redirecting" ? "Opening your workspace…" : "Verifying your session…"}</p></main>;
  }

  switch (route) {
    case "":
    case "dashboard":
      return <Dashboard />;
    case "account":
      return <AccountSettings />;
    case "productivity":
      return <Productivity />;
    default:
      return <main className="shell"><h1>Page not found</h1><p className="subtle">This WorkX page does not exist.</p></main>;
  }
}
