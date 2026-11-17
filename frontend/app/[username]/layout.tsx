"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/RouteError";
import { ArrowLeft, Home, ShieldAlert, UserRoundX } from "lucide-react";

type WorkspaceCheck = "checking" | "valid" | "missing" | "forbidden";

function WorkspaceMessage({ missing }: { missing: boolean }) {
  return <main className="shell route-message">
    <Link href="/" className="brand"><span className="brand-mark">W</span>workx<span className="accent">.</span></Link>
    <div className="route-message-card">
      <div className="route-message-icon">{missing ? <UserRoundX size={25}/> : <ShieldAlert size={25}/>}</div>
      <div className="eyebrow">WORKX / {missing ? "404 — WORKSPACE NOT FOUND" : "403 — ACCESS RESTRICTED"}</div>
      <h1>{missing ? <>This workspace doesn't <span className="accent">exist.</span></> : <>This space isn't <span className="accent">yours to open.</span></>}</h1>
      <p>{missing ? "We couldn't find a WorkX account for this username. Check the address for a typo, or return home and open your own workspace." : "You're signed in, but this workspace belongs to another account. For privacy, WorkX only lets you access your own personal workspace."}</p>
      <div className="route-message-actions"><Link href="/" className="btn btn-primary"><Home size={16}/> Back to Home</Link><button className="btn" onClick={() => window.history.back()}><ArrowLeft size={15}/> Go back</button></div>
      <span className="mono route-message-code">{missing ? "ERROR 404 · UNKNOWN USERNAME" : "ERROR 403 · PRIVATE WORKSPACE"}</span>
    </div>
  </main>;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user, status } = useAuth();
  const [check, setCheck] = useState<WorkspaceCheck>("checking");

  useEffect(() => {
    let active = true;
    setCheck("checking");
    api<{ exists: boolean }>(`/users/${encodeURIComponent(username)}/exists`, { skipAuthRedirect: true })
      .then(({ exists }) => {
        if (!active) return;
        if (!exists) { setCheck("missing"); return; }
        setCheck("valid");
      })
      .catch(() => { if (active) setCheck("missing"); });
    return () => { active = false; };
  }, [username]);

  useEffect(() => {
    if (check !== "valid" || status === "loading") return;
    if (status === "unauthenticated") router.replace("/login");
    else if (user && user.username !== username) setCheck("forbidden");
  }, [check, status, user, username, router]);

  if (check === "checking" || (check === "valid" && status === "loading")) return <LoadingState label="Checking this WorkX workspace…" />;
  if (check === "missing") return <WorkspaceMessage missing />;
  if (check === "forbidden") return <WorkspaceMessage missing={false} />;
  if (status === "unauthenticated") return <LoadingState label="Taking you to sign in…" />;
  if (status !== "authenticated" || !user) return <LoadingState />;
  return <>{children}</>;
}
