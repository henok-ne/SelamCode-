import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthSide } from "@/components/auth-side";
export const metadata: Metadata = { title: "Begin your journey" };
export default function RegisterPage() { return <div className="container-wide grid min-h-[calc(100vh-76px)] gap-12 py-12 lg:grid-cols-2 lg:py-14"><div className="flex items-center justify-center py-5"><Suspense fallback={<p className="text-sm text-muted">Loading registration…</p>}><AuthForm mode="register" /></Suspense></div><AuthSide /></div>; }
