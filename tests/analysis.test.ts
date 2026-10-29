import { describe, expect, it } from "vitest";
import { analyzeCode } from "@/lib/analysis";
import { getExercise } from "@/lib/exercises";

describe("analyzeCode", () => {
  it("flags the starter FizzBuzz code as incorrect and locates the branch order bug", () => {
    const exercise = getExercise("fizzbuzz")!;
    const analysis = analyzeCode(exercise, exercise.starterCode);
    expect(analysis.correct).toBe(false);
    expect(analysis.line).not.toBeNull();
    expect(analysis.patch).toBeTruthy();
  });
  it("recognizes a corrected FizzBuzz implementation as correct", () => {
    const exercise = getExercise("fizzbuzz")!;
    const fixed = `def fizzbuzz(n):\n    result = []\n    for number in range(1, n + 1):\n        if number % 15 == 0:\n            result.append("FizzBuzz")\n        elif number % 3 == 0:\n            result.append("Fizz")\n        elif number % 5 == 0:\n            result.append("Buzz")\n        else:\n            result.append(str(number))\n    return result\n`;
    const analysis = analyzeCode(exercise, fixed);
    expect(analysis.correct).toBe(true);
  });
  it("produces a minimal patch that actually applies to the student code", () => {
    const exercise = getExercise("largest-number")!;
    const analysis = analyzeCode(exercise, exercise.starterCode);
    expect(analysis.patch).toContain("largest = numbers[0]");
  });
  it("provides parallel Amharic guidance for every exercise", () => {
    const exercise = getExercise("count-vowels")!;
    const analysis = analyzeCode(exercise, exercise.starterCode);
    expect(analysis.amharic.concept.length).toBeGreaterThan(0);
    expect(/[\u1200-\u137F]/.test(analysis.amharic.concept)).toBe(true);
  });
});
