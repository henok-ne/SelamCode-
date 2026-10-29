import { describe, expect, it } from "vitest";
import { exercises, getExercise, toExerciseView, conceptTags } from "@/lib/exercises";

describe("exercise library", () => {
  it("ships exactly the 8 required beginner exercises", () => {
    expect(exercises).toHaveLength(8);
  });
  it("gives every exercise at least 4 test cases and a hidden test", () => {
    for (const exercise of exercises) {
      expect(exercise.testCases.length).toBeGreaterThanOrEqual(4);
      expect(exercise.testCases.some((test) => test.hidden)).toBe(true);
    }
  });
  it("tags every exercise with at least one concept", () => {
    for (const exercise of exercises) expect(exercise.conceptTags.length).toBeGreaterThan(0);
    expect(conceptTags.length).toBeGreaterThan(0);
  });
  it("finds an exercise by slug and returns undefined for an unknown one", () => {
    expect(getExercise("fizzbuzz")?.title).toBe("FizzBuzz");
    expect(getExercise("does-not-exist")).toBeUndefined();
  });
});

describe("toExerciseView", () => {
  it("never exposes hidden test inputs or expected outputs to the client", () => {
    const view = toExerciseView(getExercise("fizzbuzz")!);
    expect(view).not.toHaveProperty("testCases");
    expect(view.visibleTests.length).toBeLessThan(view.testCount);
    expect(view.hiddenCount).toBe(view.testCount - view.visibleTests.length);
  });
  it("only includes tests explicitly marked as visible", () => {
    const exercise = getExercise("prime-number")!;
    const view = toExerciseView(exercise);
    const visibleNames = new Set(exercise.testCases.filter((test) => !test.hidden).map((test) => test.name));
    for (const test of view.visibleTests) expect(visibleNames.has(test.name)).toBe(true);
  });
});
