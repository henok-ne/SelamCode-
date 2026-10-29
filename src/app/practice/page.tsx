import type { Metadata } from "next";
import { FlaskConical, ArrowDownRight } from "lucide-react";
import { exercises, conceptTags, toExerciseView } from "@/lib/exercises";
import { ExerciseLibrary } from "@/components/exercise-library";
import { Footer } from "@/components/footer";
export const metadata: Metadata = { title: "The practice room" };
export default function PracticePage() { return <><section className="container-wide pb-16 pt-12 lg:pt-16"><div className="mb-10 flex items-end justify-between gap-8"><div><p className="eyebrow mb-4">The practice room</p><h1 className="section-title">A little challenge.<br className="sm:hidden"/> A new way of thinking.</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted">Choose a problem, bring it to life in Python, and work through the tricky bits. There’s no timer here. Understanding takes the time it takes.</p></div><div className="hidden items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 lg:flex"><FlaskConical size={19} className="text-honey"/><div><p className="text-[11px] font-medium">A learning-first experiment</p><p className="mt-1 text-[10px] text-muted">8 exercises · beginner Python</p></div><ArrowDownRight size={16} className="ml-3 text-muted"/></div></div><ExerciseLibrary exercises={exercises.map(toExerciseView)} tags={conceptTags}/></section><Footer/></>; }
