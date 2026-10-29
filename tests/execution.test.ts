import { describe, expect, it } from "vitest";
import { runPreview, errorCategory, redactTests } from "@/lib/execution";
import { getExercise } from "@/lib/exercises";

describe("runPreview", () => {
  it("fails the unmodified FizzBuzz starter code on its illustrative checks", () => {
    const exercise = getExercise("fizzbuzz")!;
    const result = runPreview(exercise, exercise.starterCode);
    expect(result.status).toBe("failed");
    expect(result.mode).toBe("preview");
    expect(result.notice).toMatch(/preview/i);
  });
  it("passes a corrected FizzBuzz implementation", () => {
    const exercise = getExercise("fizzbuzz")!;
    const fixed = `def fizzbuzz(n):\n    result = []\n    for number in range(1, n + 1):\n        if number % 15 == 0:\n            result.append("FizzBuzz")\n        elif number % 3 == 0:\n            result.append("Fizz")\n        elif number % 5 == 0:\n            result.append("Buzz")\n        else:\n            result.append(str(number))\n    return result\n`;
    const result = runPreview(exercise, fixed);
    expect(result.status).toBe("passed");
    expect(result.tests.every((test) => test.passed)).toBe(true);
  });
  it("reports an error when the required function is missing, without executing anything", () => {
    const exercise = getExercise("fizzbuzz")!;
    const result = runPreview(exercise, "x = 1\n");
    expect(result.status).toBe("error");
    expect(result.errorMessage).toMatch(/fizzbuzz/);
  });
  it("never reveals hidden test inputs or expected values", () => {
    const exercise = getExercise("fizzbuzz")!;
    const result = runPreview(exercise, exercise.starterCode);
    for (const test of result.tests) {
      if (test.hidden) {
        expect(test).not.toHaveProperty("args");
        expect(test).not.toHaveProperty("expected");
        expect(test).not.toHaveProperty("actual");
      }
    }
  });
});

describe("redactTests", () => {
  it("strips arguments and expected values from hidden tests only", () => {
    const tests = [
      { name: "visible", hidden: false, passed: true, args: [1], expected: 1, actual: 1 },
      { name: "secret", hidden: true, passed: false, args: [2], expected: 2, actual: 3 },
    ];
    const redacted = redactTests(tests);
    expect(redacted[0]).toHaveProperty("args");
    expect(redacted[1]).not.toHaveProperty("args");
    expect(redacted[1]).not.toHaveProperty("actual");
  });
});

describe("errorCategory", () => {
  it("labels a passed result as having no error", () => {
    expect(errorCategory({ status: "passed", errorMessage: null, tests: [] })).toBe("No error");
  });
  it("classifies a timeout message", () => {
    expect(errorCategory({ status: "error", errorMessage: "Execution stopped after the time limit.", tests: [] })).toBe("Timeout");
  });
  it("classifies a Python TypeError", () => {
    expect(errorCategory({ status: "error", errorMessage: "TypeError: unsupported operand", tests: [] })).toBe("Type mismatch");
  });
  it("falls back to incorrect output for a failed status with no error message", () => {
    expect(errorCategory({ status: "failed", errorMessage: null, tests: [] })).toBe("Incorrect output");
  });
});
