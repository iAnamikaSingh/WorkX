"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, ShieldAlert, Trash2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AccountSettings(){
 const [user,setUser]=useState<User|null>(null);
 const [username,setUsername]=useState("");
 const [usernameStatus,setUsernameStatus]=useState("");
 const [usernameAvailable,setUsernameAvailable]=useState(false);
 const [checkingUsername,setCheckingUsername]=useState(false);
 const [savingUsername,setSavingUsername]=useState(false);
 const [password,setPassword]=useState("");
 const [show,setShow]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [confirm,setConfirm]=useState(false);
 const router=useRouter();

 useEffect(()=>{api<{user:User|null}>("/auth/me").then(r=>{if(!r.user)router.replace("/login");else{setUser(r.user);setUsername(r.user.username)}}).catch(e=>setError((e as Error).message))},[router]);

 useEffect(()=>{
  if(!user)return;
  const normalized=username.trim().toLowerCase();
  if(!/^[a-z0-9_]{3,20}$/.test(normalized)){setUsernameAvailable(false);setUsernameStatus("Use 3–20 letters, numbers or underscores.");return;}
  if(normalized===user.username){setUsernameAvailable(true);setUsernameStatus("This is your current username.");return;}
  setCheckingUsername(true);setUsernameAvailable(false);
  const timer=setTimeout(async()=>{
   try{const result=await api<{available:boolean;message?:string}>("/auth/check-username?username="+encodeURIComponent(normalized));setUsernameAvailable(result.available);setUsernameStatus(result.message||(result.available?"Username is available.":"That username is already taken. Please choose another."));}
   catch(e){setUsernameStatus((e as Error).message);}
   finally{setCheckingUsername(false);}
  },350);
  return()=>clearTimeout(timer);
 },[username,user]);

 async function saveUsername(e:React.FormEvent){
  e.preventDefault();if(!usernameAvailable||checkingUsername||!user)return;
  setError("");setSavingUsername(true);
  try{const result=await api<{user:User;message:string}>("/auth/username",{method:"PATCH",body:JSON.stringify({username:username.trim().toLowerCase()})});setUser(result.user);setUsername(result.user.username);setUsernameStatus(result.message);}
  catch(e){setError((e as Error).message);}
  finally{setSavingUsername(false);}
 }
 async function removeAccount(){setError("");setBusy(true);try{await api("/auth/account",{method:"DELETE",body:JSON.stringify({password})});router.replace("/");router.refresh()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <main className="shell" style={{paddingTop:38,paddingBottom:80,maxWidth:900}}>
  <Link href="/dashboard" className="subtle" style={{display:"inline-flex",gap:8,alignItems:"center"}}><ArrowLeft size={14}/> Back to dashboard</Link>
  <div style={{marginTop:34}}><div className="eyebrow">WORKX / ACCOUNT</div><h1 style={{fontSize:42,letterSpacing:-2,margin:"12px 0"}}>Account <span className="accent">settings.</span></h1><p className="subtle">Manage your account and its security.</p></div>
  {error&&<div className="notice error">{error}</div>}
  <section className="stat-card" style={{marginTop:26}}>
   <span>ACCOUNT DETAILS</span><p className="subtle" style={{margin:"8px 0 4px"}}>{user?.email||"Loading…"}</p>
   <form onSubmit={saveUsername} style={{marginTop:18}}>
    <div className="field"><label>USERNAME</label><input value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} minLength={3} maxLength={20} pattern="[a-z0-9_]{3,20}" required/><small className="subtle" style={{display:"block",marginTop:7}}>{checkingUsername?"Checking username…":usernameStatus}</small></div>
    <button className="btn btn-primary" disabled={!usernameAvailable||checkingUsername||savingUsername||username.trim().toLowerCase()===user?.username}>{savingUsername?<><LoaderCircle size={14}/> Saving…</>:"Save username"}</button>
   </form>
   <p className="subtle" style={{marginTop:18}}>To change your password, use the <Link href="/forgot-password" style={{color:"var(--green)"}}>password reset flow</Link> with access to your email.</p>
  </section>
  <section className="danger-panel"><div style={{display:"flex",gap:10,alignItems:"center"}}><ShieldAlert color="#ff9c9c" size={19}/><h2>Delete account</h2></div><p>This permanently deletes your WorkX account and all associated learning logs. This action cannot be undone. You must confirm your current password.</p>{!confirm?<button className="btn danger-btn" onClick={()=>setConfirm(true)}><Trash2 size={15}/> Delete my account</button>:<><div className="field"><label>YOUR CURRENT PASSWORD</label><div className="password-field"><input type={show?"text":"password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Confirm with your password"/><button type="button" className="password-toggle" onClick={()=>setShow(v=>!v)} aria-label={show?"Hide password":"Show password"}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div><div style={{display:"flex",gap:9,flexWrap:"wrap"}}><button className="btn danger-btn" disabled={busy||!password} onClick={removeAccount}>{busy?<LoaderCircle size={15}/>:<Trash2 size={15}/>} Permanently delete account</button><button className="btn" disabled={busy} onClick={()=>{setConfirm(false);setPassword("");setError("")}}>Cancel</button></div></>}</section>
 </main>
}