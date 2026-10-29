import { createHmac } from "node:crypto";
import type { HintRequest, Submission, Exercise, User, FeedbackEvent } from "@prisma/client";
import { errorCategory } from "./execution";
import { HINT_LEVELS, type ExecutionResult } from "./types";
export type ResearchSubmission = Submission & { exercise: Exercise; user: Pick<User, "id" | "passwordHash">; hints: (HintRequest & { feedback: FeedbackEvent[] })[] };
export function anonymizeStudent(id: string, secret: string) {
  return `SC-${createHmac("sha256", secret || "selamcode-local-research").update(id).digest("hex").slice(0, 8)}`;
}
export function aggregateResearch(submissions: ResearchSubmission[], secret: string) {
  const hints = submissions.flatMap((submission) => submission.hints);
  const finals = submissions.filter((submission) => submission.isFinal);
  const count = (items: string[], value: string) => items.filter((item) => item === value).length;
  const categories = Object.fromEntries(["planning", "debugging", "optimization"].map((category) => [category, count(hints.map((hint) => hint.category), category)]));
  const errors: Record<string, number> = {};
  for (const submission of submissions) {
    const result = JSON.parse(submission.testResultsJson) as ExecutionResult;
    const category = errorCategory(result);
    if (category !== "No error") errors[category] = (errors[category] || 0) + 1;
  }
  const pairs = new Map<string, ResearchSubmission[]>();
  for (const submission of submissions) {
    const key = `${submission.userId}:${submission.exerciseId}`;
    pairs.set(key, [...(pairs.get(key) || []), submission]);
  }
  const hintCounts: number[] = [];
  for (const attempts of pairs.values()) {
    const firstSolve = attempts.find((attempt) => attempt.status === "passed" && attempt.executionMode === "sandbox");
    if (firstSolve) hintCounts.push(attempts.filter((attempt) => attempt.createdAt <= firstSolve.createdAt).reduce((sum, attempt) => sum + attempt.hints.length, 0));
  }
  return {
    totalSubmissions: finals.length, totalRuns: submissions.length, hintsRequested: hints.length,
    helpful: hints.filter((hint) => hint.wasHelpful === true).length,
    notHelpful: hints.filter((hint) => hint.wasHelpful === false).length,
    unrated: hints.filter((hint) => hint.wasHelpful === null).length,
    categories, levels: Object.fromEntries(HINT_LEVELS.map((level) => [level, count(hints.map((hint) => hint.hintLevel), level)])),
    errors: Object.entries(errors).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    averageHintsToSolve: hintCounts.length ? Math.round(hintCounts.reduce((a, b) => a + b, 0) / hintCounts.length * 10) / 10 : null,
    solvedPairs: hintCounts.length, feedbackEvents: hints.reduce((sum, hint) => sum + hint.feedback.length, 0),
    recent: [...finals].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 25).map((submission) => ({
      id: submission.id, studentId: anonymizeStudent(submission.userId, secret || submission.user.passwordHash),
      task: submission.exercise.title, status: submission.status, hints: submissions.filter((attempt) => attempt.userId === submission.userId && attempt.exerciseId === submission.exerciseId && attempt.createdAt <= submission.createdAt).reduce((sum, attempt) => sum + attempt.hints.length, 0),
      mode: submission.executionMode, createdAt: submission.createdAt.toISOString(),
    })),
  };
}
export type ResearchData = ReturnType<typeof aggregateResearch>;
