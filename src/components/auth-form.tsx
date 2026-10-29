"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, FlaskConical, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./auth-provider";
import { api } from "@/lib/client-api";
import type { SessionUser } from "@/lib/types";
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const router = useRouter();
  const params = useSearchParams();
  const { setUser, demoEnabled } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nextPath = params.get("next") || (register ? "/practice" : "/practice");
  const safeNext = /^\/(practice|dashboard)(\/[a-z0-9-]+)?$/.test(nextPath) ? nextPath : "/practice";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const body = Object.fromEntries(form.entries());
      const data = await api<{ user: SessionUser }>(`/api/auth/${mode}`, body);
      setUser(data.user); router.push(role === "instructor" && register ? "/dashboard" : safeNext); router.refresh();
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  async function demo(demoRole: "student" | "instructor") {
    setBusy(true); setError("");
    try { const data = await api<{ user: SessionUser }>("/api/auth/demo", { role: demoRole }); setUser(data.user); router.push(demoRole === "instructor" ? "/dashboard" : "/practice"); router.refresh(); }
    catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  return <div className="mx-auto w-full max-w-[420px]">
    <p className="eyebrow mb-4">{register ? "A new way to learn" : "Welcome back, curious mind"}</p>
    <h1 className="font-display text-3xl font-semibold tracking-[-0.04em]">{register ? "Make room for your next aha." : "Pick up where you left off."}</h1>
    <p className="mb-8 mt-3 text-sm leading-6 text-muted">{register ? "A small account. A little progress. Your own way forward." : "Your exercises and little breakthroughs are waiting."}</p>
    <form onSubmit={submit} className="space-y-5">
      {register && <><div><label htmlFor="displayName" className="label">What should we call you?</label><input className="field" id="displayName" name="displayName" autoComplete="nickname" placeholder="Your first name or a nickname" required minLength={2} maxLength={50} /></div><fieldset><legend className="label">I’m joining as a</legend><div className="grid grid-cols-2 gap-2">{[{value:"student",label:"Student",icon:GraduationCap},{value:"instructor",label:"Instructor",icon:FlaskConical}].map(({value,label,icon:Icon})=><label key={value} className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-xs transition ${role===value ? "border-teal-500/60 bg-teal-400/5 text-teal-300" : "border-line text-muted"}`}><input type="radio" name="role" value={value} checked={role===value} onChange={()=>setRole(value)} className="sr-only" /><Icon size={15} />{label}</label>)}</div></fieldset>{role === "instructor" && <div><label htmlFor="inviteCode" className="label">Research invite code</label><input className="field" id="inviteCode" name="inviteCode" type="password" required minLength={8} maxLength={128} autoComplete="off" /><p className="mt-2 text-[11px] text-muted">Provided by your research administrator. Not required for students.</p></div>}</>}
      <div><label htmlFor="email" className="label">Email address</label><input className="field" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></div>
      <div><label htmlFor="password" className="label">Password</label><div className="relative"><input className="field pr-12" id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "At least 8 characters" : "Your password"} minLength={8} maxLength={128} required /><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 px-3.5 text-muted hover:text-ink">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
      {error && <p role="alert" className="rounded-lg border border-danger/25 bg-danger/5 p-3 text-xs leading-6 text-danger">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : <>{register ? "Create your account" : "Sign in"}<ArrowRight size={16} /></>}</Button>
    </form>
    <p className="mt-6 text-center text-xs text-muted">{register ? "Already part of the journey?" : "New to SelamCode?"} <Link href={register ? "/login" : "/register"} className="ml-1 font-medium text-teal-300 hover:underline">{register ? "Sign in" : "Create an account"}</Link></p>
    {demoEnabled && <div className="mt-8 rounded-xl border border-dashed border-line p-4"><p className="mb-3 flex items-center gap-2 text-[11px] text-honey"><FlaskConical size={13} />Local research demo</p><div className="flex gap-2"><Button variant="secondary" disabled={busy} onClick={()=>demo("student")} className="min-h-9 flex-1 px-2 py-2 text-[11px]">Try as a student</Button><Button variant="secondary" disabled={busy} onClick={()=>demo("instructor")} className="min-h-9 flex-1 px-2 py-2 text-[11px]">View as instructor</Button></div><p className="mt-3 text-[10px] leading-5 text-muted">Shared demo accounts. No fabricated activity. Please don’t use private code or personal information.</p></div>}
    <p className="mt-7 flex items-start justify-center gap-2 text-[10px] leading-5 text-muted/70"><ShieldCheck size={13} className="mt-1 shrink-0" />Passwords are hashed. Code and hint activity are stored for learning and instructor research.</p>
  </div>;
}
