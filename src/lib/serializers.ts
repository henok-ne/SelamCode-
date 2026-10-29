import type { HintRequest, Submission } from "@prisma/client";
import type { ExecutionResult, HintView, SubmissionView, HintLevel, HintCategory } from "./types";
export function hintView(hint: HintRequest): HintView {
  return { id: hint.id, hintLevel: hint.hintLevel as HintLevel, category: hint.category as HintCategory,
    aiResponse: hint.aiResponse, wasHelpful: hint.wasHelpful, language: hint.language as "en" | "am",
    provider: hint.provider, notice: hint.notice, createdAt: hint.createdAt.toISOString() };
}
export function submissionView(submission: Submission & { hints: HintRequest[] }): SubmissionView {
  const result = JSON.parse(submission.testResultsJson) as ExecutionResult;
  return { ...result, id: submission.id, isFinal: submission.isFinal, createdAt: submission.createdAt.toISOString(), hints: submission.hints.map(hintView) };
}
