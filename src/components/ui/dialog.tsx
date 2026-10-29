"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (open && !dialog?.open) dialog?.showModal(); else if (!open && dialog?.open) dialog.close(); }, [open]);
  return <dialog ref={ref} onCancel={onClose} onClick={(event) => { if (event.target === ref.current) onClose(); }} aria-labelledby="dialog-title" className="w-[calc(100%-32px)] max-w-md rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/65">
    <div className="p-6"><div className="mb-4 flex items-center justify-between gap-4"><h2 id="dialog-title" className="font-display text-lg font-semibold">{title}</h2><button onClick={onClose} aria-label="Close dialog" className="rounded-md p-2 text-muted hover:bg-elevated"><X size={18} /></button></div>{children}</div>
  </dialog>;
}
