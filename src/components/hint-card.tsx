"use client";
import { useState } from "react";
import Markdown from "react-markdown";
import { ThumbsUp, ThumbsDown, Loader2, Sparkles, BookOpen } from "lucide-react";
import { api } from "@/lib/client-api";
import type { HintView } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
export function HintCard({ hint, onSubmit }: { hint: HintView; onSubmit: () => void }) {
  const [rating,setRating] = useState(hint.wasHelpful);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [saved,setSaved] = useState(false);
  async function rate(value: boolean) {
    if(busy) return;
    setBusy(true); setError("");
    try { await api(`/api/feedback/${hint.id}`,{rating:value}); setRating(value); setSaved(true); }
    catch(error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  return <article className="animate-enter overflow-hidden rounded-xl border border-teal-500/20 bg-teal-900/10" aria-label={`${STAGE_LABELS[hint.hintLevel]} hint`}><div className="flex items-center justify-between border-b border-teal-500/10 px-4 py-3"><span className="flex items-center gap-1.5 text-[10px] font-medium text-teal-300">{hint.hintLevel==="reveal" ? <Sparkles size={12}/> : <BookOpen size={12}/>} {STAGE_LABELS[hint.hintLevel]}</span><span className="font-mono text-[8px] capitalize text-muted">{hint.category} · {hint.language==="am" ? "አማርኛ" : "EN"}</span></div><div className="p-4"><div className="hint-prose" lang={hint.language}><Markdown skipHtml disallowedElements={["img","script","style","iframe"]}>{hint.aiResponse}</Markdown></div>{hint.notice && <p className="mt-3 border-t border-line pt-3 text-[9px] leading-5 text-muted">{hint.notice}</p>}<div className="mt-4 border-t border-teal-500/10 pt-3"><p className="mb-2 text-[9px] text-muted">Did this help you move forward?</p><div className="flex gap-2">{[{value:true,label:"Helpful",icon:ThumbsUp},{value:false,label:"Not helpful",icon:ThumbsDown}].map(({value,label,icon:Icon})=><button key={label} disabled={busy} onClick={()=>rate(value)} aria-pressed={rating===value} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[9px] transition",rating===value ? "border-teal-400/40 bg-teal-400/10 text-teal-300" : "border-line text-muted hover:bg-elevated")}>{busy ? <Loader2 size={11} className="animate-spin"/> : <Icon size={11}/>} {label}</button>)}</div>{saved && <p role="status" className="mt-2 text-[9px] text-teal-300">Thanks—your feedback is saved.</p>}{error && <p role="alert" className="mt-2 text-[10px] leading-5 text-danger">{error}</p>}</div>{hint.hintLevel==="reveal" && <button onClick={onSubmit} className="mt-4 text-[10px] font-medium text-teal-300 hover:underline">Tried the idea? Submit your attempt →</button>}</div></article>;
}
