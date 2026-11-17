import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return <main className="shell route-message">
    <Link href="/" className="brand"><span className="brand-mark">W</span>workx<span className="accent">.</span></Link>
    <div className="route-message-card">
      <div className="route-message-icon"><SearchX size={25}/></div>
      <div className="eyebrow">WORKX / 404 — PAGE NOT FOUND</div>
      <h1>This page went <span className="accent">off track.</span></h1>
      <p>The page you're looking for doesn't exist or may have moved. Check the URL, or head back to WorkX and continue from your workspace.</p>
      <div className="route-message-actions"><Link href="/" className="btn btn-primary"><Home size={16}/> Back to Home</Link><button className="btn" onClick={() => history.back()}><ArrowLeft size={15}/> Go back</button></div>
      <span className="mono route-message-code">ERROR 404 · THE REQUESTED PAGE WAS NOT FOUND</span>
    </div>
  </main>;
}
