"use client";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

type Props = {
  busy: boolean;
  children: React.ReactNode;
  waitingMessages?: string[];
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
};
const defaults = ["Securing your request…","Checking your details…","Almost there…"];
export default function LoadingButton({busy,children,waitingMessages=defaults,className="btn btn-primary",style,disabled=false,type="submit",onClick}:Props){
  const [index,setIndex]=useState(0);
  useEffect(()=>{if(!busy){setIndex(0);return;}const timer=setInterval(()=>setIndex(v=>(v+1)%waitingMessages.length),1800);return()=>clearInterval(timer)},[busy,waitingMessages.length]);
  return <button type={type} className={className+" async-button "+(busy?"is-busy":"")} style={style} disabled={disabled||busy} onClick={onClick} aria-live="polite" aria-busy={busy}>
    {busy?<><span className="async-loader"><LoaderCircle size={16}/></span><span className="async-label"><span className="async-main">Please wait</span><span className="async-sub">{waitingMessages[index]}</span></span><span className="async-dots"><i/><i/><i/></span></>:children}
    {busy&&<span className="async-progress"><i/></span>}
  </button>;
}
