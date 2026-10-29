"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { createContext, useContext } from "react";
const ToastContext = createContext<(message: string, error?: boolean) => void>(() => {});
export function ClientProviders({ children }: { children: ReactNode }) {
  const notify = useCallback((message: string, error = false) => setToast({ message, error, id: Date.now() }), []);
  const [toast, setToast] = useState<{ message: string; error: boolean; id: number } | null>(null);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 5500); return () => clearTimeout(timer); }, [toast]);
  return <ToastContext.Provider value={notify}>{children}<div aria-live="polite" aria-atomic="true">{toast && <div key={toast.id} className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-lg -translate-x-1/2 animate-enter items-start gap-3 rounded-xl border border-line bg-elevated p-4 text-sm shadow-2xl">{toast.error ? <AlertCircle className="shrink-0 text-honey" size={18} /> : <CheckCircle2 className="shrink-0 text-teal-400" size={18} />}<span className="flex-1">{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)} className="text-muted"><X size={16} /></button></div>}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
