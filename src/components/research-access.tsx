"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { api } from "@/lib/client-api";
import type { SessionUser } from "@/lib/types";
import { Button } from "./ui/button";
export function ResearchAccess() {
  const {user,demoEnabled,setUser}=useAuth();const router= useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function demo(){setBusy(true);try{const data=await api<{user:SessionUser}>("/api/auth/demo",{role:"instructor"});setUser(data.user);router.refresh();}catch(error){setError((error as Error).message);}finally{setBusy(false);}}
  return <section className="container-wide flex min-h-[75vh] items-center justify-center py-16"><div className="card max-w-xl p-8 text-center sm:p-12"><span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/5 text-teal-400"><FlaskConical size={26} strokeWidth={1.5}/></span><p className="eyebrow mb-3">The research notebook</p><h1 className="font-display text-2xl font-semibold tracking-tight">A space for thoughtful observation.</h1><p className="mt-4 text-sm leading-7 text-muted">{user ? "Your current account is a student account. The research dashboard is available to instructors, keeping learner activity in the appropriate hands." : "Sign in with an instructor account to explore real submissions, hint feedback, and learning patterns. Student identities are anonymized."}</p><div className="mt-7 flex flex-wrap justify-center gap-3">{!user && <Link href="/login?next=/dashboard" className="btn-primary">Instructor sign in<ArrowRight size={15}/></Link>}{demoEnabled && <Button variant="secondary" disabled={busy} onClick={demo}>{busy ? <Loader2 size={15} className="animate-spin"/> : <FlaskConical size={15}/>}Explore the instructor demo</Button>}{user && <Link href="/practice" className="btn-primary">Back to practice<ArrowRight size={15}/></Link>}</div>{error && <p role="alert" className="mt-4 text-xs text-danger">{error}</p>}<p className="mt-7 flex items-center justify-center gap-2 text-[10px] leading-5 text-muted"><ShieldCheck size={13} className="shrink-0"/>Instructor access requires an administrator-issued invite.</p></div></section>;
}
