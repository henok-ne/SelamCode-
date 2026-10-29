import { describe, expect, it } from "vitest";
import { canRequestHint, validateAiResponse, offlineHint } from "@/lib/tutor";
import { getExercise } from "@/lib/exercises";
import type { PromptContext } from "@/lib/tutor";

describe("canRequestHint", () => {
  it("allows understand as the very first hint", () => {
    expect(canRequestHint("understand", [])).toBe(true);
  });
  it("blocks locate before understand has been shown", () => {
    expect(canRequestHint("locate", [])).toBe(false);
  });
  it("allows locate once understand has been shown", () => {
    expect(canRequestHint("locate", ["understand"])).toBe(true);
  });
  it("blocks reveal until every earlier stage has been completed", () => {
    expect(canRequestHint("reveal", ["understand", "locate", "conceptual"])).toBe(false);
    expect(canRequestHint("reveal", ["understand", "locate", "conceptual", "directional", "specific"])).toBe(true);
  });
  it("does not allow requesting the same stage twice", () => {
    expect(canRequestHint("conceptual", ["understand", "locate", "conceptual"])).toBe(false);
  });
});

describe("validateAiResponse", () => {
  const code = "def fizzbuzz(n):\n    return []\n";
  it("rejects a non-reveal hint that contains a code fence", () => {
    const text = "Here is the fix:\n```python\ndef fizzbuzz(n):\n    return []\n```";
    expect(validateAiResponse(text, "conceptual", code, "en")).toBe(false);
  });
  it("rejects a hint that exceeds the 120-word limit", () => {
    const text = Array.from({ length: 150 }, () => "word").join(" ");
    expect(validateAiResponse(text, "understand", code, "en")).toBe(false);
  });
  it("accepts a short, plain-language conceptual hint", () => {
    const text = "Think about the order of your if and elif branches. Which condition runs first for a number divisible by both 3 and 5?";
    expect(validateAiResponse(text, "conceptual", code, "en")).toBe(true);
  });
  it("rejects an Amharic hint that contains no Amharic script", () => {
    expect(validateAiResponse("This is plain English text.", "understand", code, "am")).toBe(false);
  });
  it("rejects a reveal response without a valid unified diff", () => {
    const text = "### Problematic lines\nLine 4.\n\n### Explanation\nSomething is off.";
    expect(validateAiResponse(text, "reveal", code, "en")).toBe(false);
  });
});

describe("offlineHint", () => {
  function baseContext(overrides: Partial<PromptContext> = {}): PromptContext {
    return {
      exercise: { title: "FizzBuzz", description: "", conceptTags: [] },
      studentCode: getExercise("fizzbuzz")!.starterCode,
      runtime: { status: "failed", stdout: "", errorMessage: null, mode: "preview", notice: "" },
      testResults: [], previousHints: [], learnerLevel: "new", hintLevel: "understand", category: "debugging", language: "en",
      ...overrides,
    };
  }
  it("never includes a full function definition before the reveal stage", () => {
    const hint = offlineHint(getExercise("fizzbuzz")!, baseContext({ hintLevel: "specific" }));
    expect(hint.text).not.toMatch(/^\s*def\s+\w+\(/m);
  });
  it("marks itself clearly as offline guidance", () => {
    const hint = offlineHint(getExercise("fizzbuzz")!, baseContext());
    expect(hint.provider).toBe("offline");
    expect(hint.notice).toMatch(/offline/i);
  });
  it("produces a reveal hint with a minimal diff for the buggy starter code", () => {
    const hint = offlineHint(getExercise("fizzbuzz")!, baseContext({ hintLevel: "reveal" }));
    expect(hint.text).toContain("```diff");
    expect(hint.text).toContain("Minimal diff");
  });
});
