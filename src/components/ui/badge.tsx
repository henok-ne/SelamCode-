import { cn } from "@/lib/utils";
export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium", difficulty === "Easy" ? "bg-teal-400/10 text-teal-300" : difficulty === "Medium" ? "bg-honey/10 text-honey" : "bg-danger/10 text-danger")}><span className="h-1 w-1 rounded-full bg-current" />{difficulty}</span>;
}
export function StatusBadge({ status, mode }: { status: string; mode?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium capitalize", status === "passed" ? "bg-teal-400/10 text-teal-300" : status === "failed" ? "bg-honey/10 text-honey" : "bg-danger/10 text-danger")}>{status === "passed" ? "Checks passed" : status === "failed" ? "Needs a look" : "Could not verify"}{mode === "preview" && " · preview"}</span>;
}
