"use client";
import { ApiError } from "@/lib/api";

export function ErrorMessage({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Something went wrong. Please try again.";
  return <div className="notice error" role="alert"><span>{message}</span>{onRetry && <button type="button" className="btn btn-ghost" onClick={onRetry} style={{ marginLeft: 12 }}>Try again</button>}</div>;
}
export function LoadingState({ label = "Loading your workspace…" }: { label?: string }) {
  return <main className="shell" aria-live="polite" aria-busy="true"><p className="loading">{label}</p></main>;
}
