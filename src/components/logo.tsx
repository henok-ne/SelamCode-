import Link from "next/link";
import { cn } from "@/lib/utils";
export function Logo({ small = false }: { small?: boolean }) {
  return <Link href="/" aria-label="SelamCode home" className="group inline-flex shrink-0 items-center gap-2.5"><span className={cn("flex items-center justify-center rounded-lg bg-teal-400 text-[#17392f] transition group-hover:rotate-[-5deg]", small ? "h-7 w-7" : "h-8 w-8")}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="4" r="2" fill="currentColor"/></svg></span><span className={cn("font-display font-bold tracking-[-0.045em]", small ? "text-lg" : "text-xl")}>Selam<span className="font-medium text-teal-400">Code</span><span className="text-teal-400">.</span></span></Link>;
}
