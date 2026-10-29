"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, LogOut, FlaskConical } from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "./auth-provider";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { useToast } from "./client-providers";
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const links = [{ href: "/practice", label: "Practice" }, { href: "/about", label: "Our approach" }, { href: "/dashboard", label: "Research", icon: true }];
  async function logout() { setBusy(true); try { await api("/api/auth/logout", {}); setUser(null); setOpen(false); router.push("/"); router.refresh(); } catch (error) { toast((error as Error).message, true); } finally { setBusy(false); } }
  return <header className="relative z-30 border-b border-line/70 bg-canvas/95"><div className="container-wide flex h-[76px] items-center justify-between gap-6"><Logo /><nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">{links.map((link) => <Link key={link.href} href={link.href} className={cn("flex items-center gap-1.5 text-xs font-medium transition hover:text-teal-300", pathname.startsWith(link.href) ? "text-teal-300" : "text-muted")}>{link.icon && <FlaskConical size={13} />}{link.label}</Link>)}</nav><div className="hidden items-center gap-4 md:flex">{user ? <><span className="max-w-28 truncate text-xs text-muted" title={user.displayName}>{user.displayName}</span><button onClick={logout} disabled={busy} aria-label="Sign out" className="rounded-md p-2 text-muted hover:bg-surface hover:text-ink"><LogOut size={16} /></button></> : <Link href="/login" className="text-xs font-medium text-muted hover:text-ink">Sign in</Link>}<Link href={user ? "/practice" : "/register"} className="btn-primary min-h-9 px-4 py-2 text-xs">{user ? "Your workspace" : "Get started"}<ArrowUpRight size={14} /></Link></div><button className="rounded-lg p-2 md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>{open && <nav aria-label="Mobile navigation" className="absolute inset-x-0 top-full border-b border-line bg-surface p-5 shadow-xl md:hidden"><div className="flex flex-col gap-2">{links.map((link) => <Link onClick={() => setOpen(false)} key={link.href} href={link.href} className="rounded-lg p-3 text-sm text-muted hover:bg-elevated">{link.label}</Link>)}{user ? <button onClick={logout} disabled={busy} className="p-3 text-left text-sm text-muted">Sign out · {user.displayName}</button> : <><Link onClick={() => setOpen(false)} href="/login" className="p-3 text-sm">Sign in</Link><Link onClick={() => setOpen(false)} href="/register" className="btn-primary">Get started</Link></>}</div></nav>}</header>;
}
