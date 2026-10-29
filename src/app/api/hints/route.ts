import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, ApiError, parseBody, rateLimit, requireUser } from "@/lib/api";
import { hintSchema } from "@/lib/validation";
import { getExercise } from "@/lib/exercises";
import { canRequestHint, getTutorHint, type PromptContext } from "@/lib/tutor";
import { hintView } from "@/lib/serializers";
import type { ExecutionResult } from "@/lib/types";
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await parseBody(request, hintSchema);
    rateLimit(`hint:${user.id}`, 20);
    const submission = await db.submission.findFirst({ where: { id: body.submissionId, userId: user.id }, include: { exercise: true, hints: { orderBy: { createdAt: "asc" } } } });
    if (!submission) throw new ApiError(404, "Run your code before requesting a hint.");
    const latest = await db.submission.findFirst({ where: { userId: user.id, exerciseId: submission.exerciseId }, orderBy: { createdAt: "desc" }, select: { id: true } });
    if (latest?.id !== submission.id) throw new ApiError(409, "You have a newer run. Use the latest result before asking for guidance.");
    if (!canRequestHint(body.hintLevel, submission.hints.map((hint) => hint.hintLevel))) throw new ApiError(409, "Follow the hint stages in order, one step at a time. This stage may already be open.");
    const exercise = getExercise(submission.exercise.slug);
    if (!exercise) throw new ApiError(404, "Exercise not found.");
    const runtime = JSON.parse(submission.testResultsJson) as ExecutionResult;
    const context: PromptContext = {
      exercise: { title: exercise.title, description: exercise.description, conceptTags: exercise.conceptTags },
      studentCode: submission.code,
      runtime: { status: runtime.status, stdout: runtime.stdout, errorMessage: runtime.errorMessage, mode: runtime.mode, notice: runtime.notice },
      testResults: runtime.tests, previousHints: submission.hints.map((hint) => ({ level: hint.hintLevel, text: hint.aiResponse })),
      learnerLevel: body.learnerLevel, hintLevel: body.hintLevel, category: body.category, language: body.language,
    };
    const hint = await getTutorHint(exercise, context);
    const created = await db.hintRequest.create({ data: {
      submissionId: submission.id, hintLevel: body.hintLevel, category: body.category,
      promptContextJson: JSON.stringify(context), aiResponse: hint.text, language: hint.language,
      provider: hint.provider, notice: hint.notice,
    } });
    return NextResponse.json({ hint: hintView(created), highlightLine: body.hintLevel === "understand" ? null : hint.analysis.line }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return NextResponse.json({ error: "This hint is already being created. Reload the workspace to see it." }, { status: 409 });
    return apiError(error);
  }
}
