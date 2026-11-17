"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, Menu, Settings, ShieldCheck, Target, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Props = { active: "dashboard" | "productivity" | "account" | "admin" };

export default function WorkspaceSidebar({ active }: Props) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const base = user?.username ? `/${encodeURIComponent(user.username)}` : "";
  const links = [
    { href: `${base}/dashboard`, label: "Learning logs", key: "dashboard", Icon: BookOpen },
    { href: `${base}/productivity`, label: "Productivity hub", key: "productivity", Icon: Target },
    { href: `${base}/account`, label: "Account settings", key: "account", Icon: Settings }
  ] as const;
  const adminLink = user?.role === "admin" ? { href: `${base}/admin`, label: "Admin dashboard", key: "admin" as const, Icon: ShieldCheck } : null;

  async function logout() {
    try { await signOut(); } finally { router.replace("/login"); }
  }

  return <>
    <aside className="sidebar" aria-label="Workspace navigation">
      <Link href={`${base}/dashboard`} className="brand" aria-label="WorkX dashboard">
        <span className="brand-mark">W</span><span>WorkX</span>
      </Link>
      <div className="side-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {links.map(({ href, label, key, Icon }) =>
          <Link key={key} href={href} aria-current={active === key ? "page" : undefined}
            className={`side-link ${active === key ? "active" : ""}`}>
            <Icon size={17} strokeWidth={1.8}/><span>{label}</span>
          </Link>
        )}
        {adminLink && <Link href={adminLink.href} aria-current={active === "admin" ? "page" : undefined} className={`side-link ${active === "admin" ? "active" : ""}`}><adminLink.Icon size={17} strokeWidth={1.8}/><span>{adminLink.label}</span></Link>}
      </nav>
      <div className="side-bottom">
        <div className="side-label">SIGNED IN AS</div>
        <div title={user?.username || "Your account"}>{user?.username || "Your account"}</div>
        <button onClick={logout} className="side-link" style={{ width: "100%", background: "transparent", border: 0, textAlign: "left" }}>
          <LogOut size={16} strokeWidth={1.8}/><span>Sign out</span>
        </button>
      </div>
    </aside>
    <div className="mobile-header">
      <Link href={`${base}/dashboard`} className="brand"><span className="brand-mark">W</span>WorkX</Link>
      <button className="btn btn-ghost mobile-menu" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation" aria-expanded={open}>
        {open ? <X size={18}/> : <Menu size={18}/>}
      </button>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">
      {links.map(({ href, label, key, Icon }) =>
        <Link key={key} href={href} onClick={() => setOpen(false)} className={`side-link ${active === key ? "active" : ""}`}>
          <Icon size={16}/>{label}
        </Link>
      )}
      {adminLink && <Link href={adminLink.href} onClick={() => setOpen(false)} className={`side-link ${active === "admin" ? "active" : ""}`}><adminLink.Icon size={16}/>{adminLink.label}</Link>}
      <button onClick={logout} className="side-link" style={{ width: "100%", background: "transparent", border: 0, textAlign: "left" }}>
        <LogOut size={16}/> Sign out
      </button>
    </nav>}
  </>;
}
