import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Code2, FlaskConical, Languages, Lightbulb, LockKeyhole, Play, Sparkles, BookOpen } from "lucide-react";
import { Footer } from "@/components/footer";
import { DifficultyBadge } from "@/components/ui/badge";
import { exercises } from "@/lib/exercises";

const stages = ["Understand", "Locate", "Concept", "Direction", "Specific", "Optional fix"];
function CodePreview() {
  return <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto">
    <div className="absolute -inset-8 -z-10 rounded-full bg-teal-400/[0.025] blur-3xl" />
    <div className="overflow-hidden rounded-xl border border-[#35484d] bg-[#152126] shadow-[0_24px_80px_-24px_#0009]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5"><div className="flex items-center gap-2 text-xs text-muted"><Code2 size={15} className="text-teal-400" /><span className="font-mono text-[11px]">fizzbuzz.py</span></div><span className="rounded bg-teal-400/10 px-2 py-1 font-mono text-[9px] text-teal-300">PYTHON</span></div>
      <div className="px-2 py-5 font-mono text-[11px] leading-[2.1] sm:text-xs" aria-label="Example Python code">
        {[
          <><span className="text-[#c3a6d8]">def</span> <span className="text-[#a8d8cc]">fizzbuzz</span>(n):</>,
          <>    result = []</>,
          <>    <span className="text-[#c3a6d8]">for</span> number <span className="text-[#c3a6d8]">in</span> <span className="text-[#a8d8cc]">range</span>(<span className="text-honey">1</span>, n + <span className="text-honey">1</span>):</>,
          <>        <span className="text-[#c3a6d8]">if</span> number % <span className="text-honey">3</span> == <span className="text-honey">0</span>:</>,
          <>            result.append(<span className="text-honey">&quot;Fizz&quot;</span>)</>,
          <>        <span className="text-[#c3a6d8]">elif</span> number % <span className="text-honey">5</span> == <span className="text-honey">0</span>:</>,
          <>            result.append(<span className="text-honey">&quot;Buzz&quot;</span>)</>,
          <span className="text-muted" key="more">        …</span>,
        ].map((line, index) => <div key={index} className={`flex ${index === 3 ? "border-l-2 border-honey bg-honey/[0.06]" : "border-l-2 border-transparent"}`}><span className="w-11 shrink-0 select-none text-right text-[#536a73]">{index + 1}</span><span className="whitespace-pre pl-5">{line}</span></div>)}
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3"><span className="flex items-center gap-1.5 font-mono text-[10px] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-honey" />A small bug. A chance to learn.</span><span className="flex items-center gap-1.5 text-[10px] text-teal-300"><Play size={10} fill="currentColor" />Run & reflect</span></div>
    </div>
    <div className="relative -mt-1 ml-5 mr-[-8px] rounded-xl border border-teal-500/35 bg-[#1c302e] p-5 shadow-soft sm:ml-12 sm:mr-[-16px]">
      <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-teal-300"><span className="rounded-md bg-teal-400/10 p-1.5"><Lightbulb size={14} /></span>A nudge, not the answer</span><span className="font-mono text-[9px] text-teal-300/65">HINT 02 / 05</span></div>
      <p className="text-[13px] leading-6 text-[#d5e3de]">What happens when a number is divisible by <em className="font-medium not-italic text-teal-300">both</em> 3 and 5? Try following <code className="rounded bg-canvas/50 px-1.5 py-0.5 font-mono text-[11px]">15</code> through your conditions.</p>
      <div className="mt-4 flex items-center gap-1.5">{stages.slice(0,5).map((stage,i)=><span key={stage} className={`h-1 flex-1 rounded-full ${i < 2 ? "bg-teal-400" : "bg-teal-400/15"}`} />)}<span className="ml-2 text-[9px] text-teal-300/65">Your pace. Your discovery.</span></div>
    </div>
    <p className="mt-4 text-right font-mono text-[9px] text-muted/60">AN ILLUSTRATION OF THE LEARNING EXPERIENCE</p>
  </div>;
}
export default function LandingPage() {
  return <>
    <section className="hero-glow relative overflow-hidden">
      <div className="container-wide grid items-center gap-14 pb-20 pt-14 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="animate-enter">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-teal-400/20 bg-teal-400/[0.04] py-1.5 pl-2 pr-3.5"><span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-[11px] text-teal-300" lang="am">ሰላም</span><span className="text-[10px] tracking-wide text-teal-300/85">A friendly place to figure things out</span></div>
          <h1 className="hero-title font-display font-semibold">Learn to debug,<br /><span className="text-teal-400">not just to copy.</span></h1>
          <p className="mt-7 max-w-[450px] text-[15px] leading-[1.9] text-muted">The moment your code doesn’t work is the moment learning begins. Meet a Python tutor that helps you find your own way forward—one thoughtful hint at a time.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/practice" className="btn-primary px-6">Start practicing<ArrowRight size={16} /></Link><Link href="#how-it-works" className="btn-ghost px-4">See how it works<ArrowUpRight size={15} /></Link></div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-muted">{["Made for beginners", "English & Amharic", "Your thinking comes first"].map((text)=><span key={text} className="flex items-center gap-1.5"><Check size={12} className="text-teal-500" />{text}</span>)}</div>
        </div>
        <div className="animate-enter px-1 pb-3 sm:px-5 lg:px-0" style={{ animationDelay: "100ms" }}><CodePreview /></div>
      </div>
    </section>
    <section id="how-it-works" className="border-y border-line bg-surface/40">
      <div className="container-wide py-9"><div className="mb-7 flex flex-wrap items-center justify-between gap-3"><p className="eyebrow">Understanding is a process, not a shortcut</p><span className="text-[11px] text-muted">A little more help, only when you need it.</span></div><ol className="grid grid-cols-3 gap-y-7 sm:grid-cols-6">{stages.map((stage,index)=><li key={stage} className="relative flex items-center gap-2.5 sm:gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${index===0 ? "border-teal-400/50 bg-teal-400/10 text-teal-300" : index===5 ? "border-dashed border-line text-muted/70" : "border-line text-muted"}`}>{index===5 ? <LockKeyhole size={11} /> : `0${index+1}`}</span><span className={`text-[11px] font-medium ${index===0 ? "text-teal-300" : "text-muted"}`}>{stage}</span>{index<5 && <span className="mx-auto hidden h-px w-5 bg-line sm:block lg:w-8" />}</li>)}</ol></div>
    </section>
    <section className="container-wide py-20 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p className="eyebrow mb-4">Designed around the learner</p><h2 className="section-title leading-[1.25]">Less “here’s the answer.”<br />More “look at this.”</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted">Built with students in Ethiopia and other low-resource learning environments in mind. No race to finish. No wall of generated code. Just space to think.</p><Link href="/about" className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-teal-300 hover:text-teal-400">The thinking behind SelamCode<ArrowUpRight size={14} /></Link></div>
      <div className="grid gap-4 sm:grid-cols-2"><article className="card group p-6 transition hover:border-teal-500/40"><Lightbulb size={21} strokeWidth={1.5} className="mb-5 text-teal-400" /><h3 className="font-display text-base font-semibold">Hints that know when to stop</h3><p className="mt-2.5 text-xs leading-6 text-muted">From the underlying idea to a gentle nudge. A possible fix stays behind your explicit choice.</p></article><article className="card group p-6 transition hover:border-teal-500/40"><Languages size={21} strokeWidth={1.5} className="mb-5 text-honey" /><h3 className="font-display text-base font-semibold">A little closer to home</h3><p className="mt-2.5 text-xs leading-6 text-muted">Explore guidance in English or Amharic, with honest fallback when a translation isn’t reliable.</p><p className="mt-3 text-xs text-honey/80" lang="am">በአንድነት እንማራለን።</p></article><article className="card group p-6 transition hover:border-teal-500/40"><FlaskConical size={21} strokeWidth={1.5} className="mb-5 text-honey" /><h3 className="font-display text-base font-semibold">Better questions, not big numbers</h3><p className="mt-2.5 text-xs leading-6 text-muted">An instructor view of which hints help, where learners get stuck, and what to explore next.</p></article><article className="card group p-6 transition hover:border-teal-500/40"><BookOpen size={21} strokeWidth={1.5} className="mb-5 text-teal-400" /><h3 className="font-display text-base font-semibold">Your code. Your understanding.</h3><p className="mt-2.5 text-xs leading-6 text-muted">Small, purposeful Python exercises. Run, notice, question, and try again—with your work saved.</p></article></div></div>
    </section>
    <section className="border-y border-line bg-surface/30"><div className="container-wide py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">A good place to start</p><h2 className="font-display text-2xl font-semibold tracking-tight">Small problems. Real lightbulb moments.</h2></div><Link href="/practice" className="flex items-center gap-2 text-xs font-medium text-teal-300">Explore all 8 exercises<ArrowRight size={14} /></Link></div><div className="grid gap-4 md:grid-cols-3">{[exercises[0],exercises[2],exercises[7]].map((exercise,index)=><Link key={exercise.slug} href={`/practice/${exercise.slug}`} className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:border-teal-500/40"><div className="mb-5 flex items-center justify-between"><span className="font-mono text-[10px] text-muted/60">EXERCISE 0{index+1}</span><DifficultyBadge difficulty={exercise.difficulty} /></div><h3 className="font-display text-base font-semibold">{exercise.title}</h3><p className="mb-5 mt-2 line-clamp-2 text-xs leading-6 text-muted">{exercise.description}</p><div className="mt-auto flex items-center justify-between"><span className="tag">{exercise.conceptTags[0]}</span><ArrowUpRight size={17} className="text-muted transition group-hover:text-teal-300" /></div></Link>)}</div></div></section>
    <section className="container-wide py-16"><div className="relative flex flex-col items-start justify-between gap-7 overflow-hidden rounded-xl border border-teal-500/20 bg-teal-900/25 px-7 py-10 sm:flex-row sm:items-center sm:px-10"><div><div className="mb-3 flex items-center gap-2 text-xs text-teal-300"><Sparkles size={15} />Your next “aha” is waiting.</div><h2 className="font-display text-2xl font-semibold tracking-tight">Bring your code. Bring your curiosity.</h2><p className="mt-3 text-xs text-muted">You don’t have to get it right. You just have to begin.</p></div><Link href="/practice" className="btn-primary shrink-0">Let’s try something<ArrowRight size={16} /></Link></div></section>
    <Footer />
  </>;
}
