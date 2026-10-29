"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Code2, FlaskConical, Info, Lightbulb, Loader2, LockKeyhole, MessageCircle, PanelRightClose, PanelRightOpen, Play, RotateCcw, Send, Terminal, XCircle, Eye, Save } from "lucide-react";
import type { ExerciseView, HintCategory, HintLevel, HintView, LearnerLevel, SubmissionView } from "@/lib/types";
import { HINT_LEVELS, STAGE_LABELS } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { useToast } from "./client-providers";
import { api } from "@/lib/client-api";
import { Button } from "./ui/button";
import { DifficultyBadge, StatusBadge } from "./ui/badge";
import { Dialog } from "./ui/dialog";
import { HintCard } from "./hint-card";
import { cn } from "@/lib/utils";
const CodeEditor = dynamic(()=>import("./code-editor"), { ssr: false, loading: ()=> <div className="flex h-[370px] items-center justify-center bg-[#121d22] text-xs text-muted"><Loader2 size={16} className="mr-2 animate-spin"/>Preparing your editor…</div> });
const nextLabels: Record<HintLevel,string> = { understand: "Understand my code", locate: "Locate the issue", conceptual: "Explore the concept", directional: "Give me a nudge", specific: "Narrow it down", reveal: "Show possible fix" };
export function Workspace({ exercise, mode }: { exercise: ExerciseView; mode: "preview" | "sandbox" }) {
  const { user } = useAuth();
  const toast = useToast();
  const [code,setCode] = useState(exercise.starterCode);
  const [loaded,setLoaded] = useState(!user);
  const [submission,setSubmission] = useState<SubmissionView | null>(null);
  const [hints,setHints] = useState<HintView[]>([]);
  const [running,setRunning] = useState<"run" | "submit" | null>(null);
  const [hintBusy,setHintBusy] = useState(false);
  const [hintError,setHintError] = useState("");
  const [category,setCategory] = useState<HintCategory>("debugging");
  const [level,setLevel] = useState<LearnerLevel>("new");
  const [amharic,setAmharic] = useState(false);
  const [highlight,setHighlight] = useState<number | null>(null);
  const [panelOpen,setPanelOpen] = useState(true);
  const [resetOpen,setResetOpen] = useState(false);
  const [revealOpen,setRevealOpen] = useState(false);
  const [tab,setTab] = useState<"tests" | "output">("tests");
  const [draftSaved,setDraftSaved] = useState(false);
  const draftKey = `selamcode:draft:${user?.id || "guest"}:${exercise.slug}`;
  const dirty = !!submission && code !== (submission as SubmissionView & { code?: string }).code;
  const codeRef = useRef(code); codeRef.current = code;
  const storageWarned = useRef(false);
  useEffect(()=> {
    let active = true;
    let local: string | null = null;
    try { local = localStorage.getItem(draftKey); } catch { /* Browsing without storage is supported. */ }
    if (!user) { if (local !== null) setCode(local); setLoaded(true); return; }
    setLoaded(false);
    api<{ submission: (SubmissionView & { code: string }) | null }>(`/api/workspace?slug=${exercise.slug}`).then(({submission:last})=>{
      if (!active) return;
      if (local !== null) setCode(local);
      else if (last) setCode(last.code);
      if (last) {
        const saved = local === null ? last.code : local;
        if (saved === last.code) { setSubmission(last); setHints(last.hints); }
      }
    }).catch(error=>{ if (active) { if (local !== null) setCode(local); toast(`Saved attempt could not load: ${(error as Error).message}`,true); } }).finally(()=>{ if(active) setLoaded(true); });
    return ()=>{ active = false; };
  },[draftKey,user,exercise.slug,toast]);
  useEffect(()=>{
    if(!loaded) return;
    setDraftSaved(false);
    const timer = setTimeout(()=>{ try { localStorage.setItem(draftKey,code); setDraftSaved(true); } catch { if(!storageWarned.current) { storageWarned.current=true; toast("Browser storage is unavailable. Keep this tab open to retain your draft.",true); } } },500);
    return ()=>clearTimeout(timer);
  },[code,draftKey,loaded,toast]);
  const run = useCallback(async (submit = false)=> {
    if (!user) { toast("Sign in to run code and keep your learning progress.",true); return; }
    if (running || !loaded || hintBusy) return;
    if (!codeRef.current.trim()) { toast("Write some code first.",true); return; }
    setRunning(submit ? "submit" : "run"); setHintError("");
    try {
      const data = await api<{submission:SubmissionView}>("/api/run",{exerciseSlug:exercise.slug,code:codeRef.current,submit});
      const result = {...data.submission,code:codeRef.current};
      setSubmission(result); setHints([]); setHighlight(null); setTab("tests");
      toast(submit ? "Solution submitted. Every attempt is part of learning." : data.submission.status === "passed" ? `${mode === "preview" ? "Preview checks" : "All checks"} passed. Take a moment to explain why.` : "Run complete. Look at the results, then explore a hint.");
    } catch(error) { toast((error as Error).message,true); } finally { setRunning(null); }
  },[user,running,loaded,hintBusy,exercise.slug,toast,mode]);
  const onEditorRun = useCallback(()=>{ void run(false); },[run]);
  async function requestHint(hintLevel: HintLevel) {
    if (!submission || dirty || hintBusy) return;
    setHintBusy(true); setHintError("");
    try {
      const data = await api<{hint:HintView;highlightLine:number|null}>("/api/hints",{submissionId:submission.id,hintLevel,category,language:amharic ? "am" : "en",learnerLevel:level});
      setHints(current=>[...current.filter(h=>h.hintLevel!==data.hint.hintLevel),data.hint]);
      if(data.highlightLine) setHighlight(data.highlightLine);
    } catch(error) { setHintError((error as Error).message); } finally { setHintBusy(false); }
  }
  const nextStage = HINT_LEVELS.find(stage=>!hints.some(hint=>hint.hintLevel===stage));
  const completedStage = hints.length ? HINT_LEVELS[hints.length-1] : null;
  const canHint = !!user && !!submission && !dirty && !running && !hintBusy && loaded;
  const passed = submission?.status === "passed";
  const passedCount = submission?.tests.filter(test=>test.passed).length || 0;
  const reset = ()=>{ setCode(exercise.starterCode); setSubmission(null); setHints([]); setHighlight(null); setResetOpen(false); toast("Starter code restored. Your previous runs remain in your research record."); };
  return <div className="mx-auto max-w-[1720px] px-4 pb-10 pt-6 sm:px-7">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><Link href="/practice" className="mb-3 inline-flex items-center gap-1.5 text-[10px] text-muted hover:text-teal-300"><ArrowLeft size={12}/>The practice room</Link><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{exercise.title}</h1><DifficultyBadge difficulty={exercise.difficulty}/><span className="hidden text-xs text-muted sm:inline">·</span><div className="hidden gap-1.5 sm:flex">{exercise.conceptTags.map(tag=><span className="tag" key={tag}>{tag}</span>)}</div></div></div><div className="flex items-center gap-3"><span className={cn("hidden items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[9px] sm:flex",mode==="preview" ? "border-honey/20 bg-honey/5 text-honey" : "border-teal-400/20 bg-teal-400/5 text-teal-300")}><span className="h-1 w-1 rounded-full bg-current"/>{mode==="preview" ? "LOCAL PREVIEW MODE" : "ISOLATED PYTHON"}</span><button onClick={()=>setPanelOpen(!panelOpen)} aria-expanded={panelOpen} aria-controls="tutor-panel" className="btn-secondary min-h-9 px-3 py-2 text-[11px]">{panelOpen ? <PanelRightClose size={14}/> : <PanelRightOpen size={14}/>}<span>{panelOpen ? "Hide tutor" : "Show tutor"}</span></button></div></div>
    {!user && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-500/25 bg-teal-900/20 px-4 py-3"><p className="flex items-center gap-2 text-xs text-teal-300"><Info size={15}/>Explore the problem and edit freely. Sign in to run, save attempts, and ask the tutor.</p><Link href={`/login?next=/practice/${exercise.slug}`} className="flex items-center gap-1 text-xs font-semibold text-teal-300">Sign in<ArrowRight size={13}/></Link></div>}
    <div className={cn("grid items-start gap-5",panelOpen ? "lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[270px_minmax(0,1fr)_340px]" : "lg:grid-cols-[290px_minmax(0,1fr)]")}>
      <aside className="card overflow-hidden"><div className="border-b border-line px-5 py-4"><h2 className="flex items-center gap-2 text-xs font-semibold"><BookOpen size={15} className="text-teal-400"/>The challenge</h2></div><div className="p-5"><p className="eyebrow mb-3 text-[9px]">What you’re building</p><div className="space-y-3 text-xs leading-[1.9] text-muted">{exercise.description.split("\n\n").map((text,i)=><p key={i}>{text}</p>)}</div><div className="my-6 h-px bg-line"/><h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-medium"><Terminal size={13} className="text-teal-400"/>A couple of examples</h3><div className="space-y-2 rounded-lg border border-line bg-canvas p-3">{exercise.visibleTests.map(test=><div key={test.name} className="font-mono text-[10px] leading-6"><p className="text-muted">{exercise.functionName}({JSON.stringify(test.args).slice(1,-1)})</p><p className="break-all text-teal-300">→ {JSON.stringify(test.expected)}</p></div>)}</div><div className="mt-5 flex items-start gap-2 text-[10px] leading-5 text-muted"><LockKeyhole size={12} className="mt-1 shrink-0"/>{exercise.hiddenCount} hidden checks explore edge cases. You’ll see whether they pass, not their inputs.</div><div className="mt-6 rounded-lg border border-line bg-canvas/50 p-3"><p className="mb-1 text-[10px] font-medium text-honey">A small note</p><p className="text-[10px] leading-5 text-muted">The starter code contains an intentional mistake. Finding it is part of the exercise.</p></div></div></aside>
      <div className="min-w-0 space-y-5"><section className="card overflow-hidden" aria-label="Code workspace"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3"><div className="flex items-center gap-2"><Code2 size={15} className="text-teal-400"/><span className="font-mono text-[11px]">student.py</span><span className="ml-1 text-[9px] text-muted">Python 3</span></div><div className="flex items-center gap-3"><span className="flex items-center gap-1 text-[9px] text-muted">{draftSaved ? <><Check size={11}/>Draft saved locally</> : <><Save size={11}/>Local draft</>}</span><button onClick={()=>setResetOpen(true)} disabled={!!running || hintBusy} aria-label="Reset to starter code" title="Reset to starter code" className="text-muted hover:text-ink"><RotateCcw size={13}/></button></div></div><CodeEditor code={code} onChange={setCode} highlightLine={highlight} onRun={onEditorRun} readOnly={!loaded || !!running || hintBusy}/><div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3"><span className="hidden font-mono text-[9px] text-muted sm:block">⌘ / Ctrl + Enter to run</span><div className="ml-auto flex gap-2"><Button variant="secondary" disabled={!canHint} onClick={()=>run(true)} className="min-h-9 px-3.5 py-2 text-[11px]">{running==="submit" ? <Loader2 size={13} className="animate-spin"/> : <Send size={13}/>}Submit</Button><Button onClick={()=>run(false)} disabled={!user || !!running || hintBusy || !loaded} className="min-h-9 px-4 py-2 text-[11px]">{running==="run" ? <Loader2 size={13} className="animate-spin"/> : <Play size={13} fill="currentColor"/>}{running==="run" ? "Running…" : "Run Code"}</Button></div></div></section>
      <section className="card overflow-hidden" aria-label="Run results"><div className="flex items-center justify-between border-b border-line px-4"><div className="flex gap-5" role="tablist" aria-label="Execution results">{([{id:"tests",label:"Test results",icon:CheckCircle2},{id:"output",label:"Output & errors",icon:Terminal}] as const).map(({id,label,icon:Icon})=><button key={id} role="tab" id={`tab-${id}`} aria-controls={`panel-${id}`} aria-selected={tab===id} onClick={()=>setTab(id)} className={cn("flex items-center gap-1.5 border-b-2 py-3.5 text-[11px]",tab===id ? "border-teal-400 text-teal-300" : "border-transparent text-muted")}><Icon size={13}/>{label}{submission && id==="tests" && <span className="ml-1 rounded bg-elevated px-1.5 py-0.5 font-mono text-[9px]">{passedCount}/{submission.tests.length}</span>}</button>)}</div>{submission && <StatusBadge status={submission.status} mode={submission.mode}/>}</div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="min-h-[185px]">
      {!submission ? <div className="flex min-h-[185px] flex-col items-center justify-center px-5 py-8 text-center"><Terminal size={24} strokeWidth={1.3} className="mb-3 text-muted/60"/><p className="text-xs text-muted">{running ? "Checking your code…" : "Your next insight starts with a run."}</p><p className="mt-2 text-[10px] text-muted/60">{running ? "The isolated runner has a strict time limit." : "Run your code to see results and unlock your first hint."}</p></div> : tab==="tests" ? <div className="p-4"><div className="mb-3 flex items-center gap-2 text-[11px]">{passed ? <CheckCircle2 size={14} className="text-teal-400"/> : <Info size={14} className="text-honey"/>}<span className={passed ? "text-teal-300" : "text-honey"}>{passedCount} of {submission.tests.length} {submission.mode==="preview" ? "illustrative checks match" : "checks passed"}</span>{dirty && <span className="ml-auto text-[10px] text-honey">Editor changed · run again</span>}</div>{submission.tests.length ? <div className="space-y-1.5">{submission.tests.map(test=><details key={test.name} className="group rounded-md border border-line/70 bg-canvas/40"><summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-[10px]">{test.passed ? <Check size={12} className="text-teal-400"/> : <XCircle size={12} className="text-danger"/>}<span className="flex-1">{test.name}</span>{test.hidden && <LockKeyhole size={10} className="text-muted/60"/>}<span className={test.passed ? "text-teal-400" : "text-danger"}>{test.passed ? "Pass" : "Check"}</span><ChevronDown size={12} className="text-muted transition group-open:rotate-180"/></summary><div className="border-t border-line/60 px-3 py-3 font-mono text-[10px] leading-6 text-muted">{test.hidden ? "Hidden check: input and expected output are kept private. Use the visible examples to form a hypothesis." : <><p>Input: {JSON.stringify(test.args)}</p><p>Expected: {JSON.stringify(test.expected)}</p><p className="break-all">{submission.mode==="preview" ? "Illustrative result" : "Actual"}: {JSON.stringify(test.actual)}</p>{test.error && <p className="text-danger">{test.error}</p>}</>}</div></details>)}</div> : <p className="rounded-lg bg-canvas p-3 text-xs leading-6 text-muted">No test results are available. {submission.errorMessage}</p>}</div> : <div className="space-y-3 p-4"><pre className="scrollbar-thin max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-canvas p-4 font-mono text-[10px] leading-6 text-muted">{submission.stdout || "(No standard output.)"}</pre>{submission.errorMessage && <pre className="whitespace-pre-wrap break-words rounded-lg border border-danger/20 bg-danger/5 p-4 font-mono text-[10px] leading-6 text-danger">{submission.errorMessage}</pre>}</div>}
      </div>{submission && <div className="flex items-start gap-2 border-t border-line bg-honey/[0.025] px-4 py-3 text-[9px] leading-5 text-muted"><Info size={12} className="mt-1 shrink-0 text-honey"/>{submission.notice}</div>}</section>
      <div className="flex items-start gap-2 px-1 text-[10px] leading-5 text-muted/70"><FlaskConical size={13} className="mt-1 shrink-0"/>Your runs and hint ratings contribute to anonymized research. Submit records a final attempt; it doesn’t end your exploration.</div></div>
      {panelOpen && <aside id="tutor-panel" className="card overflow-hidden lg:col-span-2 2xl:col-span-1"><div className="border-b border-line px-5 py-4"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xs font-semibold"><span className="rounded-md bg-teal-400/10 p-1.5 text-teal-400"><Lightbulb size={15}/></span>Your thinking partner</h2><span className="h-1.5 w-1.5 rounded-full bg-teal-400 status-dot"/></div><p className="mt-2 text-[10px] text-muted">A little guidance. You’re still in the driver’s seat.</p></div>
      <div className="p-5"><div className="mb-5 grid grid-cols-6 gap-1" aria-label="Hint progress">{HINT_LEVELS.map((stage,index)=>{const done=hints.some(h=>h.hintLevel===stage);return <div key={stage} className="text-center"><div className={cn("mb-2 h-1 rounded-full",done ? "bg-teal-400" : nextStage===stage ? "bg-teal-400/40" : "bg-line")}/><span className={cn("text-[7px]",done ? "text-teal-300" : "text-muted/70")}>{STAGE_LABELS[stage].replace("Optional ","")}</span><span className="sr-only">{index+1}. {STAGE_LABELS[stage]} {done ? "complete" : "not shown"}</span></div>;})}</div>
      <div className="mb-5 space-y-3"><div><label htmlFor="hint-category" className="label text-[10px]">What kind of help?</label><select id="hint-category" value={category} onChange={e=>setCategory(e.target.value as HintCategory)} disabled={hintBusy} className="field min-h-9 py-2 text-[11px]"><option value="debugging">Debugging · find the issue</option><option value="planning">Planning · think through the task</option><option value="optimization">Readability · make it clearer</option></select></div><div><label htmlFor="learner-level" className="label text-[10px]">How comfortable do you feel?</label><select id="learner-level" value={level} onChange={e=>setLevel(e.target.value as LearnerLevel)} disabled={hintBusy} className="field min-h-9 py-2 text-[11px]"><option value="new">New to Python</option><option value="some">I know a few basics</option><option value="confident">Comfortable, but stuck here</option></select></div><div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5"><label htmlFor="amharic-toggle" className="flex cursor-pointer items-center gap-2 text-[11px]"><span className="text-honey text-xs">አማ</span>Explain in Amharic</label><button id="amharic-toggle" role="switch" aria-checked={amharic} aria-label="Explain in Amharic" disabled={hintBusy} onClick={()=>setAmharic(!amharic)} className={cn("relative h-5 w-9 rounded-full transition",amharic ? "bg-teal-400" : "bg-line")}><span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-ink transition-transform",amharic ? "translate-x-[18px]" : "translate-x-0.5")}/></button></div></div>
      <div className={cn("grid gap-4",panelOpen && "lg:grid-cols-2 2xl:grid-cols-1")} aria-live="polite">{hints.length===0 ? <div className="rounded-xl border border-dashed border-teal-500/20 bg-teal-900/10 px-5 py-8 text-center"><MessageCircle size={26} strokeWidth={1.3} className="mx-auto mb-4 text-teal-400/70"/><h3 className="font-display text-sm font-medium">Let’s figure it out together.</h3><p className="mt-2 text-[11px] leading-6 text-muted">{!submission ? "First, run your code. Then we’ll look at what it does—without jumping to the answer." : dirty ? "Your code has changed. Run it again so we can look at the same version together." : "Start by understanding the current behavior. The next step opens when you’re ready."}</p></div> : hints.map(hint=><HintCard key={hint.id} hint={hint} onSubmit={()=>run(true)} />)}</div>
      {hintError && <p role="alert" className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-[11px] leading-6 text-danger">{hintError}</p>}
      <div className="mt-5">{nextStage && nextStage!=="reveal" && <Button disabled={!canHint} onClick={()=>requestHint(nextStage)} className="w-full text-[11px]">{hintBusy ? <Loader2 size={15} className="animate-spin"/> : !submission || dirty ? <LockKeyhole size={13}/> : <Lightbulb size={14}/>} {hintBusy ? "Thinking with you…" : !submission || dirty ? "Run code to request a hint" : nextLabels[nextStage]}</Button>}{nextStage==="reveal" && <div><Button variant="secondary" disabled={!canHint} onClick={()=>setRevealOpen(true)} className="w-full border-honey/25 text-[11px] text-honey"><Eye size={14}/>Show possible fix</Button><p className="mt-2 text-center text-[9px] leading-5 text-muted">You’ve done the thinking. This choice is yours.</p></div>}{!nextStage && <div className="rounded-lg border border-line bg-canvas/40 p-3 text-center"><CheckCircle2 size={16} className="mx-auto mb-2 text-teal-400"/><p className="text-[11px] text-teal-300">Now make the idea your own.</p><p className="mt-1 text-[10px] leading-5 text-muted">Try a change, run again, or explain the fix in your own words.</p><Button variant="secondary" disabled={!canHint} onClick={()=>run(true)} className="mt-3 min-h-9 w-full text-[11px]"><Send size={12}/>Submit your attempt</Button></div>}</div>
      {completedStage && <p className="mt-4 text-center font-mono text-[8px] text-muted/60">{hints.length} OF 6 STAGES EXPLORED · NO NEED TO RUSH</p>}
      </div><div className="flex items-start gap-2 border-t border-line bg-canvas/30 px-5 py-3"><ShieldNote/></div></aside>}
    </div>
    <Dialog open={resetOpen} onClose={()=>setResetOpen(false)} title="Start with a fresh copy?"><p className="text-sm leading-7 text-muted">This replaces your editor with the original starter code and clears the current hint sequence. Previous runs stay in your research record.</p><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={()=>setResetOpen(false)}>Keep working</Button><Button onClick={reset}>Reset code</Button></div></Dialog>
    <Dialog open={revealOpen} onClose={()=>setRevealOpen(false)} title="Ready for a possible fix?"><div className="rounded-lg border border-honey/20 bg-honey/5 p-4"><Lightbulb size={19} className="mb-2 text-honey"/><p className="text-xs leading-7 text-muted">You’ll see a focused explanation and a small diff, not a rewritten solution. Before looking, can you say what you would try next?</p></div><p className="mt-4 text-xs leading-6 text-muted">There’s no penalty for looking. Afterward, run the tests and explain why the change helps.</p><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={()=>setRevealOpen(false)}>Let me think</Button><Button onClick={()=>{setRevealOpen(false);void requestHint("reveal");}}><Eye size={14}/>Show possible fix</Button></div></Dialog>
  </div>;
}
function ShieldNote() { return <><Info size={12} className="mt-1 shrink-0 text-muted"/><p className="text-[9px] leading-5 text-muted">Guidance can be imperfect. Test your ideas, and ask your instructor when you’re unsure. Source code may be sent to the configured AI provider.</p></>; }
