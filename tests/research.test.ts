import { describe, expect, it } from "vitest";
import { aggregateResearch, anonymizeStudent, type ResearchSubmission } from "@/lib/research";

function makeSubmission(overrides: Partial<ResearchSubmission> = {}): ResearchSubmission {
  const base = {
    id: "sub-1", userId: "user-1", exerciseId: "ex-1", code: "def f(): pass", status: "failed",
    runtimeOutput: "", errorMessage: "TypeError: boom", executionMode: "preview", testResultsJson: JSON.stringify({ status: "failed", errorMessage: "TypeError: boom" }),
    isFinal: false, createdAt: new Date("2026-01-01T10:00:00Z"),
    exercise: { id: "ex-1", title: "FizzBuzz" } as never,
    user: { id: "user-1", passwordHash: "hash-1" },
    hints: [],
  };
  return { ...base, ...overrides } as ResearchSubmission;
}

describe("anonymizeStudent", () => {
  it("is deterministic for the same user id and secret", () => {
    expect(anonymizeStudent("user-1", "secret")).toBe(anonymizeStudent("user-1", "secret"));
  });
  it("differs across distinct student ids", () => {
    expect(anonymizeStudent("user-1", "secret")).not.toBe(anonymizeStudent("user-2", "secret"));
  });
  it("never includes the raw user id in the output", () => {
    expect(anonymizeStudent("user-1", "secret")).not.toContain("user-1");
  });
});

describe("aggregateResearch", () => {
  it("returns all-zero, honest results for an empty dataset rather than fabricating numbers", () => {
    const data = aggregateResearch([], "secret");
    expect(data.totalSubmissions).toBe(0);
    expect(data.hintsRequested).toBe(0);
    expect(data.averageHintsToSolve).toBeNull();
    expect(data.recent).toEqual([]);
  });
  it("counts only final submissions toward totalSubmissions, while totalRuns counts every attempt", () => {
    const data = aggregateResearch([makeSubmission({ isFinal: false }), makeSubmission({ id: "sub-2", isFinal: true })], "secret");
    expect(data.totalSubmissions).toBe(1);
    expect(data.totalRuns).toBe(2);
  });
  it("breaks down hints by category and counts helpful vs. not-helpful ratings", () => {
    const hints = [
      { id: "h1", category: "planning", hintLevel: "understand", wasHelpful: true, feedback: [{}] },
      { id: "h2", category: "debugging", hintLevel: "locate", wasHelpful: false, feedback: [] },
      { id: "h3", category: "debugging", hintLevel: "conceptual", wasHelpful: null, feedback: [] },
    ] as never;
    const data = aggregateResearch([makeSubmission({ hints })], "secret");
    expect(data.hintsRequested).toBe(3);
    expect(data.categories.planning).toBe(1);
    expect(data.categories.debugging).toBe(2);
    expect(data.helpful).toBe(1);
    expect(data.notHelpful).toBe(1);
    expect(data.unrated).toBe(1);
  });
  it("only credits a verified sandbox pass toward average hints to solve, not a preview pass", () => {
    const previewPass = makeSubmission({ status: "passed", executionMode: "preview", hints: [{ id: "h1", feedback: [] }, { id: "h2", feedback: [] }] as never });
    const dataFromPreview = aggregateResearch([previewPass], "secret");
    expect(dataFromPreview.averageHintsToSolve).toBeNull();
    const sandboxPass = makeSubmission({ status: "passed", executionMode: "sandbox", hints: [{ id: "h1", feedback: [] }, { id: "h2", feedback: [] }] as never });
    const dataFromSandbox = aggregateResearch([sandboxPass], "secret");
    expect(dataFromSandbox.averageHintsToSolve).toBe(2);
  });
  it("anonymizes the student id in the recent submissions table", () => {
    const data = aggregateResearch([makeSubmission({ isFinal: true })], "secret");
    expect(data.recent[0].studentId).toMatch(/^SC-[0-9a-f]{8}$/);
    expect(data.recent[0].studentId).not.toContain("user-1");
  });
});
