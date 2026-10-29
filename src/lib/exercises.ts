import rawExercises from "@/data/exercises.json";
import type { ExerciseView, TestCase } from "./types";
export interface ExerciseData extends Omit<ExerciseView, "visibleTests" | "testCount" | "hiddenCount"> { testCases: TestCase[]; }
export const exercises = rawExercises as ExerciseData[];
export function getExercise(slug: string) { return exercises.find((exercise) => exercise.slug === slug); }
// This is the only exercise serializer allowed into browser components.
// Hidden inputs and expected values must never cross the server/client boundary.
export function toExerciseView(exercise: ExerciseData): ExerciseView {
  const { testCases, ...publicFields } = exercise;
  return { ...publicFields,
    visibleTests: testCases.filter((test) => !test.hidden).map(({ name, args, expected }) => ({ name, args, expected })),
    testCount: testCases.length, hiddenCount: testCases.filter((test) => test.hidden).length,
  };
}
export const conceptTags = [...new Set(exercises.flatMap((exercise) => exercise.conceptTags))];
