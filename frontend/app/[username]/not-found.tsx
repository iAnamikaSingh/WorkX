import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function UsernameNotFound() {
  return <main className="shell route-message">
    <Link href="/" className="brand"><span className="brand-mark">W</span>workx<span className="accent">.</span></Link>
    <div className="route-message-card">
      <div className="route-message-icon"><SearchX size={25}/></div>
      <div className="eyebrow">404 — PAGE NOT FOUND</div>
      <h1>Page not <span className="accent">found.</span></h1>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <div className="route-message-actions">
        <Link href="/" className="btn btn-primary"><Home size={16}/> Go home</Link>
      </div>
      <span className="mono route-message-code">ERROR 404</span>
    </div>
  </main>;
}
