"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { authService } from "@/lib/services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (step !== 4) return;
    const timer = window.setTimeout(() => router.replace("/login"), 1800);
    return () => window.clearTimeout(timer);
  }, [step, router]);

  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-wrap">
    <aside className="auth-side">
      <Link href="/" className="brand"><span className="brand-mark">W</span>workx.</Link>
      <div className="auth-message">
        <div className="eyebrow">ACCOUNT RECOVERY</div>
        <h1>Back to your <span className="accent">momentum.</span></h1>
        <p>Verify your email address and choose a new password. Your learning history stays right where it is.</p>
      </div>
      <span className="mono" style={{ color: "#668071", fontSize: 10 }}>SECURE PASSWORD RESET</span>
    </aside>

    <section className="auth-main">
      <div className="auth-card">
        <Link href="/login" className="subtle" style={{ display: "inline-flex", gap: 7, alignItems: "center", marginBottom: 30 }}>
          <ArrowLeft size={14}/> Back to sign in
        </Link>

        {step === 4 ? <div className="reset-success" role="status" aria-live="polite">
          <CheckCircle2 size={42} className="accent"/>
          <h2>Password updated.</h2>
          <p className="subtle">Your new password is ready. Redirecting you to sign in…</p>
          <Link href="/login" className="btn btn-primary" style={{ width: "100%", marginTop: 22 }}>Continue to sign in</Link>
        </div> : <>
          <h2>Reset your password.</h2>
          <p className="subtle">We'll send a one-time code to your registered account email.</p>
          <div className="auth-steps">
            <span className={"auth-step " + (step === 1 ? "active" : "")}>01 / EMAIL</span>
            <span className={"auth-step " + (step === 2 ? "active" : "")}>02 / VERIFY</span>
            <span className={"auth-step " + (step === 3 ? "active" : "")}>03 / RESET</span>
          </div>
          {error && <div className="notice error" role="alert">{error}</div>}
          {info && <div className="notice" role="status">{info}</div>}

          {step === 1 && <>
            <div className="field">
              <label>ACCOUNT EMAIL</label>
              <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" disabled={busy}/>
            </div>
            <LoadingButton busy={busy} disabled={!email.trim()} waitingMessages={["Checking whether your account exists…", "Preparing your recovery code…", "Sending your secure email…"]} style={{ width: "100%" }} onClick={() => void run(async () => {
              const result = await authService.requestPasswordReset(email.trim());
              setInfo(result.message);
              setStep(2);
            })}>Send reset code</LoadingButton>
          </>}

          {step === 2 && <>
            <div className="field">
              <label>6-DIGIT EMAIL CODE</label>
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, "").slice(0, 6))} placeholder="000000" disabled={busy}/>
            </div>
            <LoadingButton busy={busy} disabled={otp.length !== 6} waitingMessages={["Checking your verification code…", "Confirming your identity…", "Authorizing password reset…"]} style={{ width: "100%" }} onClick={() => void run(async () => {
              const result = await authService.verifyPasswordReset(email, otp);
              setInfo(result.message);
              setStep(3);
            })}>Verify code</LoadingButton>
            <LoadingButton type="button" className="btn btn-ghost" busy={busy} style={{ width: "100%", marginTop: 9 }} waitingMessages={["Preparing another code…", "Sending your email…", "Check your inbox shortly…"]} onClick={() => void run(async () => {
              const result = await authService.requestPasswordReset(email.trim());
              setInfo(result.message);
            })}>Resend code</LoadingButton>
          </>}

          {step === 3 && <>
            <div className="field">
              <label>NEW PASSWORD</label>
              <div className="password-field">
                <input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" disabled={busy}/>
                <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
              </div>
            </div>
            <div className="field">
              <label>CONFIRM NEW PASSWORD</label>
              <div className="password-field">
                <input type={showConfirm ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Enter it again" disabled={busy}/>
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}>{showConfirm ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
              </div>
            </div>
            {password.length > 0 && password.length < 8 && <p className="field-hint">Use at least 8 characters.</p>}
            {confirm.length > 0 && password !== confirm && <p className="field-hint error-text">The passwords do not match.</p>}
            <LoadingButton busy={busy} disabled={password.length < 8 || password !== confirm} waitingMessages={["Updating your password…", "Saving your new password securely…", "Finishing your account update…"]} style={{ width: "100%" }} onClick={() => void run(async () => {
              const result = await authService.resetPassword(email.trim(), password);
              setInfo(result.message);
              setStep(4);
            })}>Update password</LoadingButton>
            <p className="subtle reset-wait-hint">Keep this page open while we securely update your password.</p>
          </>}
        </>}
      </div>
    </section>
  </main>;
}
