import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExercise, toExerciseView, exercises } from "@/lib/exercises";
import { Workspace } from "@/components/workspace";
import { executionMode } from "@/lib/execution";
export function generateStaticParams() { return exercises.map(exercise=>({slug:exercise.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}): Promise<Metadata> { const {slug}=await params;return {title:getExercise(slug)?.title || "Exercise"}; }
export default async function ExercisePage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params;const exercise=getExercise(slug);if(!exercise)notFound();return <Workspace exercise={toExerciseView(exercise)} mode={executionMode()}/>; }
