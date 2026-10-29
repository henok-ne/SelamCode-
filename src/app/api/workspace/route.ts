import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, ApiError, requireUser } from "@/lib/api";
import { getExercise } from "@/lib/exercises";
import { submissionView } from "@/lib/serializers";
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const slug = new URL(request.url).searchParams.get("slug") || "";
    const exercise = getExercise(slug);
    if (!exercise) throw new ApiError(404, "Exercise not found.");
    const submission = await db.submission.findFirst({ where: { userId: user.id, exercise: { slug } }, orderBy: { createdAt: "desc" }, include: { hints: { orderBy: { createdAt: "asc" } } } });
    return NextResponse.json({ submission: submission ? { ...submissionView(submission), code: submission.code } : null });
  } catch (error) { return apiError(error); }
}
