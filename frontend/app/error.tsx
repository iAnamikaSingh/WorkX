"use client";
import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("WorkX application error:", error); }, [error]);
  return <main className="shell route-message" role="alert">
    <Link href="/" className="brand"><span className="brand-mark">W</span>workx<span className="accent">.</span></Link>
    <div className="route-message-card">
      <div className="route-message-icon"><AlertTriangle size={25}/></div>
      <div className="eyebrow">WORKX / 500 — SOMETHING WENT WRONG</div>
      <h1>A small detour. <span className="accent">Not the end.</span></h1>
      <p>We couldn't load this part of WorkX. Your saved learning data is stored separately and this error does not mean it has been deleted. Try loading the page again or return to your home screen.</p>
      <div className="route-message-actions"><button className="btn btn-primary" onClick={reset}><RefreshCw size={15}/> Try again</button><Link href="/" className="btn"><Home size={16}/> Back to Home</Link></div>
      <span className="mono route-message-code">ERROR 500 · UNEXPECTED APPLICATION ERROR</span>
    </div>
  </main>;
}
