import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, ApiError, parseBody, requireUser } from "@/lib/api";
import { feedbackSchema } from "@/lib/validation";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseBody(request, feedbackSchema);
    const hint = await db.hintRequest.findFirst({ where: { id, submission: { userId: user.id } } });
    if (!hint) throw new ApiError(404, "This hint was not found in your workspace.");
    await db.$transaction([
      db.feedbackEvent.create({ data: { hintRequestId: id, rating: body.rating, comment: body.comment } }),
      db.hintRequest.update({ where: { id }, data: { wasHelpful: body.rating } }),
    ]);
    return NextResponse.json({ ok: true, wasHelpful: body.rating });
  } catch (error) { return apiError(error); }
}
