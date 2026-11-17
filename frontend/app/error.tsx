"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="shell" role="alert" style={{ paddingTop: 64 }}>
    <div className="eyebrow">WORKX / ERROR</div><h1>Something went wrong<span className="accent">.</span></h1>
    <p className="subtle">Your account data is not affected. Please try again.</p>
    <button className="btn btn-primary" onClick={reset} style={{ marginTop: 18 }}>Reload page</button>
  </main>;
}
