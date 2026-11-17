"use client";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, Clock3, Sparkles, ShieldCheck, LayoutDashboard, ListChecks, Settings, LogOut, LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

function PersonalHome() {
 const { user, signOut } = useAuth();
 const router = useRouter();
 const [busy,setBusy] = useState(false);
 if (!user) return null;
 async function logout() { setBusy(true); try { await signOut(); router.refresh(); } finally { setBusy(false); } }
 const base = `/${encodeURIComponent(user.username)}`;
 return <main className="shell personal-home">
  <header className="topbar"><Link href="/" className="brand"><span className="brand-mark">W</span>workx<span className="accent">.</span></Link><div className="personal-top-user"><span className="personal-avatar">{user.username.slice(0,1).toUpperCase()}</span><span>{user.username}</span>{user.role==="admin"&&<span className="personal-admin-tag">ADMIN</span>}</div><button className="btn btn-ghost" onClick={logout} disabled={busy}>{busy?<LoaderCircle size={15} className="admin-spin"/>:<LogOut size={15}/>} Sign out</button></header>
  <section className="personal-hero"><div className="eyebrow"><i className="pulse"/> YOUR WORKX SPACE</div><h1>Welcome back,<br/><span className="accent">{user.username}.</span></h1><p className="hero-copy">Your learning space is ready. Pick up where you left off and keep making your progress visible.</p><div className="hero-actions"><Link className="btn btn-primary" href={`${base}/dashboard`}><LayoutDashboard size={16}/> Open dashboard <ArrowUpRight size={15}/></Link><Link className="btn" href={`${base}/productivity`}><ListChecks size={16}/> Productivity Hub</Link></div></section>
  <section className="personal-links"><div className="eyebrow">YOUR PERSONAL WORKSPACE</div><div className="personal-link-grid">
   <Link className="personal-link-card" href={`${base}/dashboard`}><LayoutDashboard/><div><strong>Dashboard</strong><p>Your learning overview and recent activity.</p></div><ArrowUpRight/></Link>
   <Link className="personal-link-card" href={`${base}/logs`}><BookOpen/><div><strong>Learning Logs</strong><p>Review the topics and sessions you've recorded.</p></div><ArrowUpRight/></Link>
   <Link className="personal-link-card" href={`${base}/productivity`}><ChartNoAxesCombined/><div><strong>Productivity Hub</strong><p>Goals, tasks, notes, bookmarks and focus tools.</p></div><ArrowUpRight/></Link>
   <Link className="personal-link-card" href={`${base}/account`}><Settings/><div><strong>Account Settings</strong><p>Manage your username and account preferences.</p></div><ArrowUpRight/></Link>
   {user.role==="admin"&&<Link className="personal-link-card personal-admin-card" href={`${base}/admin`}><ShieldCheck/><div><strong>Admin Dashboard</strong><p>Manage WorkX users and platform overview.</p></div><ArrowUpRight/></Link>}
  </div></section>
  <footer className="footer"><span>© {new Date().getFullYear()} WorkX. Make progress visible.</span><span className="mono">SIGNED IN AS {user.username.toUpperCase()}</span></footer>
 </main>;
}
function PublicHome() {
 return <main className="shell"><header className="topbar"><Link href="/" className="brand"><span className="brand-mark">W</span>workx<span style={{color:"var(--green)"}}>.</span></Link><nav className="navlinks"><a href="#features">Why WorkX</a><a href="#how">How it works</a></nav><div className="nav-actions"><Link className="btn btn-ghost" href="/login">Log in</Link><Link className="btn btn-primary" href="/signup">Get started <ArrowUpRight size={15}/></Link></div></header>
 <section className="hero"><div><div className="eyebrow"><i className="pulse"/> YOUR LEARNING, IN MOTION</div><h1>Small steps.<br/><span className="accent">Real progress.</span></h1><p className="hero-copy">A focused space to capture what you learn, keep your momentum, and turn scattered study sessions into visible growth.</p><div className="hero-actions"><Link href="/signup" className="btn btn-primary">Start tracking <ArrowUpRight size={16}/></Link><Link href="/login" className="btn">I have an account</Link></div><p className="hero-note">NO NOISE. NO PRESSURE. JUST PROGRESS.</p></div>
 <div className="preview"><div className="preview-head"><span>YOUR LEARNING SNAPSHOT</span><span className="live-dot">● LIVE VIEW</span></div><div className="preview-stat"><div><span>Weekly consistency</span><br/><strong>72<span style={{fontSize:20,color:"var(--green)"}}>%</span></strong></div><span className="mono">THIS WEEK ↗</span></div><div className="progress"><i/></div><div className="mini-list"><div className="mini-row"><span>◈ React & component design</span><small>2h 30m</small></div><div className="mini-row"><span>◈ Data structures</span><small>1h 45m</small></div><div className="mini-row"><span>◈ TypeScript fundamentals</span><small>0h 50m</small></div></div><div style={{display:"flex",justifyContent:"space-between",marginTop:20,color:"#809589",fontSize:10}}><span>3 FOCUS AREAS</span><span className="mono">KEEP GOING →</span></div></div></section>
 <section className="features" id="features"><div className="eyebrow">BUILT FOR THE LONG GAME</div><h2 className="section-title">Make your effort count.</h2><p className="section-copy">Everything you need to stay aware of your learning, without another complicated productivity system.</p><div className="feature-grid"><article className="feature"><div className="feature-icon"><BookOpen size={18}/></div><h3>Capture the details</h3><p>Break each learning session into topics and subtopics, so your progress stays meaningful and easy to revisit.</p></article><article className="feature"><div className="feature-icon"><Clock3 size={18}/></div><h3>Track your time</h3><p>Record hours and minutes spent learning. Understand where your focus actually goes.</p></article><article className="feature"><div className="feature-icon"><ChartNoAxesCombined size={18}/></div><h3>See the momentum</h3><p>Your personal logbook keeps every session in one place, helping consistency feel tangible.</p></article></div></section>
 <section id="how" style={{padding:"0 0 75px"}}><div className="feature" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}><div><div className="eyebrow"><Sparkles size={13}/> START WHERE YOU ARE</div><h2 className="section-title" style={{marginBottom:5}}>Your next session starts here.</h2><p className="section-copy">Create an account, log what you learn, and build from there.</p></div><Link href="/signup" className="btn btn-primary">Create your free account <ArrowUpRight size={15}/></Link></div></section>
 <footer className="footer"><span>© {new Date().getFullYear()} WorkX. Make progress visible.</span><span className="mono">BUILT FOR CONSISTENCY ↗</span></footer></main>;
}
export default function Home() {
 const { user, status } = useAuth();
 if (status === "loading") return <main className="shell"><p className="loading">Restoring your WorkX session…</p></main>;
 return user ? <PersonalHome/> : <PublicHome/>;
}
