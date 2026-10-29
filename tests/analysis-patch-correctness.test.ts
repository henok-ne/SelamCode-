import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { applyPatch } from "diff";
import { analyzeCode } from "@/lib/analysis";
import { exercises } from "@/lib/exercises";

// This is the most important safety property of the "Show possible fix" stage:
// the minimal diff we generate for every exercise's buggy starter code must
// actually produce a program that passes all of that exercise's real tests,
// not just look plausible. We verify this against the real Python runner
// (never the static preview) so a subtly wrong patch cannot slip through.
const runnerPath = path.resolve(__dirname, "../python/runner.py");

function runAgainstRealPython(code: string, functionName: string, testCases: unknown) {
  const output = execFileSync("python3", ["-I", "-S", runnerPath], {
    input: JSON.stringify({ code, function_name: functionName, tests: testCases }),
    encoding: "utf8", timeout: 10000,
  });
  return JSON.parse(output.split("\nSELAM_RESULT:")[1]);
}

describe("reveal-stage patch correctness (against the real Python runner)", () => {
  it("flags every built-in exercise's starter code as not yet correct", () => {
    for (const exercise of exercises) {
      const analysis = analyzeCode(exercise, exercise.starterCode);
      expect(analysis.correct, `${exercise.slug} starter should be detected as buggy`).toBe(false);
    }
  });

  for (const exercise of exercises) {
    it(`produces a patch for "${exercise.slug}" that passes every test case, including hidden ones`, () => {
      const analysis = analyzeCode(exercise, exercise.starterCode);
      expect(analysis.patch, `${exercise.slug} should offer a reveal patch`).toBeTruthy();
      const patched = applyPatch(exercise.starterCode, analysis.patch!);
      expect(patched, `${exercise.slug} patch should apply cleanly`).not.toBe(false);
      const result = runAgainstRealPython(patched as string, exercise.functionName, exercise.testCases);
      expect(result.status, `${exercise.slug} patched code: ${JSON.stringify(result.tests.filter((t: { passed: boolean }) => !t.passed))}`).toBe("passed");
      expect(result.tests.every((test: { passed: boolean }) => test.passed)).toBe(true);
    });
  }
});
