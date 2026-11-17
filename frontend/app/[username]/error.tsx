"use client";
export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="shell" role="alert" style={{ paddingTop: 64 }}>
    <div className="eyebrow">WORKX / WORKSPACE</div><h1>Something interrupted your flow<span className="accent">.</span></h1>
    <p className="subtle">{error.message || "We couldn't load this page. Your saved data is safe."}</p>
    <button className="btn btn-primary" onClick={reset} style={{ marginTop: 18 }}>Try again</button>
  </main>;
}
