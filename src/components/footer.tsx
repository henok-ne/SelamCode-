import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";
export function Footer() {
  return <footer className="border-t border-line/70"><div className="container-wide flex flex-col justify-between gap-7 py-9 sm:flex-row sm:items-center"><div><Logo small /><p className="mt-3 text-xs text-muted">A little guidance. A lot of possibility.</p></div><div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted"><Link href="/about" className="hover:text-teal-300">Learning philosophy</Link><Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-teal-300">Research notes <ArrowUpRight size={12} /></Link><span className="flex items-center gap-1.5">Built for learners, with <Heart size={12} className="text-honey" /></span></div></div><div className="container-wide flex flex-wrap justify-between gap-2 border-t border-line/40 py-4 font-mono text-[10px] text-muted/70"><span>SelamCode · Student research prototype</span><span lang="am">ሰላም · Peace, and a place to begin.</span></div></footer>;
}
