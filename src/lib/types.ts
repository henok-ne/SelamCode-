export const HINT_LEVELS = ["understand", "locate", "conceptual", "directional", "specific", "reveal"] as const;
export type HintLevel = typeof HINT_LEVELS[number];
export const STAGE_LABELS: Record<HintLevel, string> = {
  understand: "Understand", locate: "Locate", conceptual: "Concept",
  directional: "Direction", specific: "Specific", reveal: "Optional fix",
};
export const CATEGORIES = ["planning", "debugging", "optimization"] as const;
export type HintCategory = typeof CATEGORIES[number];
export type LearnerLevel = "new" | "some" | "confident";
export type ExecutionMode = "preview" | "sandbox";
export interface TestCase { name: string; args: unknown[]; expected: unknown; hidden: boolean; }
export interface TestResult { name: string; passed: boolean; hidden: boolean; args?: unknown[]; expected?: unknown; actual?: unknown; error?: string; }
export interface ExecutionResult {
  status: "passed" | "failed" | "error"; stdout: string; errorMessage: string | null;
  mode: ExecutionMode; tests: TestResult[]; durationMs: number; notice: string;
}
export interface ExerciseView {
  id: string; title: string; slug: string; difficulty: string; description: string;
  starterCode: string; expectedOutput: string; conceptTags: string[]; functionName: string;
  visibleTests: Pick<TestCase, "name" | "args" | "expected">[];
  testCount: number; hiddenCount: number; estimatedMinutes: number;
}
export interface HintView {
  id: string; hintLevel: HintLevel; category: HintCategory; aiResponse: string;
  wasHelpful: boolean | null; language: "en" | "am"; provider: string;
  notice: string | null; createdAt: string;
}
export interface SubmissionView extends ExecutionResult {
  id: string; createdAt: string; isFinal: boolean; hints: HintView[];
}
export interface SessionUser { id: string; email: string; displayName: string; role: "student" | "instructor"; }
