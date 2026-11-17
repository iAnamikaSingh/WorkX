import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function UsernameNotFound() {
  return <main className="shell route-message">
    <Link href="/" className="brand"><span className="brand-mark">W</span>workx<span className="accent">.</span></Link>
    <div className="route-message-card">
      <div className="route-message-icon"><SearchX size={25}/></div>
      <div className="eyebrow">WORKX / 404 — PAGE NOT FOUND</div>
      <h1>This isn't your <span className="accent">dashboard.</span></h1>
      <p>The workspace home page is not a separate destination. Open your dashboard using the dashboard link, or return to WorkX.</p>
      <div className="route-message-actions">
        <Link href="/" className="btn btn-primary"><Home size={16}/> Back to Home</Link>
        <Link href="/login" className="btn"><ArrowLeft size={15}/> Sign in</Link>
      </div>
      <span className="mono route-message-code">ERROR 404 · USE /USERNAME/DASHBOARD</span>
    </div>
  </main>;
}
