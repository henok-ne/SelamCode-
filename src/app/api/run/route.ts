import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, ApiError, parseBody, rateLimit, requireUser } from "@/lib/api";
import { runSchema } from "@/lib/validation";
import { getExercise } from "@/lib/exercises";
import { executeCode } from "@/lib/execution";
import { submissionView } from "@/lib/serializers";
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await parseBody(request, runSchema);
    rateLimit(`run:${user.id}`, 20);
    const exercise = getExercise(body.exerciseSlug);
    if (!exercise) throw new ApiError(404, "That exercise does not exist.");
    const record = await db.exercise.findUnique({ where: { slug: exercise.slug } });
    if (!record) throw new ApiError(503, "The exercise library needs seeding. Run npm run db:seed.");
    const result = await executeCode(exercise, body.code);
    const submission = await db.submission.create({ data: {
      userId: user.id, exerciseId: record.id, code: body.code, status: result.status,
      runtimeOutput: result.stdout, errorMessage: result.errorMessage, executionMode: result.mode,
      testResultsJson: JSON.stringify(result), isFinal: body.submit,
    }, include: { hints: true } });
    return NextResponse.json({ submission: submissionView(submission) }, { status: 201 });
  } catch (error) { return apiError(error); }
}
