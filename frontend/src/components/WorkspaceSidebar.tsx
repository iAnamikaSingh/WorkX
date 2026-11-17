"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, Menu, Settings, Target, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Props = { active: "dashboard" | "productivity" | "account" };
export default function WorkspaceSidebar({ active }: Props) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const base = user?.username ? `/${encodeURIComponent(user.username)}` : "";
  const links = [
    { href: `${base}/dashboard`, label: "My learning logs", key: "dashboard", Icon: BookOpen },
    { href: `${base}/productivity`, label: "Productivity hub", key: "productivity", Icon: Target },
    { href: `${base}/account`, label: "Account settings", key: "account", Icon: Settings }
  ] as const;
  async function logout() {
    try { await signOut(); } finally { router.replace("/login"); }
  }
  return <>
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brand-mark">W</span>workx.</Link>
      <div className="side-label">WORKSPACE</div>
      {links.map(({ href, label, key, Icon }) => <Link key={key} href={href} className={`side-link ${active === key ? "active" : ""}`}><Icon size={16}/>{label}</Link>)}
      <div className="side-bottom"><div className="side-label">ACCOUNT</div><div style={{ padding: 10, fontSize: 12, color: "#9aac9f" }}>{user?.username}</div><button onClick={logout} className="side-link" style={{ width: "100%", background: "transparent", border: 0, textAlign: "left" }}><LogOut size={16}/> Sign out</button></div>
    </aside>
    <div className="mobile-header"><Link href="/" className="brand"><span className="brand-mark">W</span>workx.</Link><button className="btn btn-ghost mobile-menu" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">{open ? <X size={18}/> : <Menu size={18}/>}</button></div>
    {open && <nav className="mobile-nav">{links.map(({ href, label, key, Icon }) => <Link key={key} href={href} onClick={() => setOpen(false)} className={`side-link ${active === key ? "active" : ""}`}><Icon size={16}/>{label}</Link>)}<button onClick={logout} className="side-link" style={{ width: "100%", background: "transparent", border: 0, textAlign: "left" }}><LogOut size={16}/> Sign out</button></nav>}
  </>;
}
