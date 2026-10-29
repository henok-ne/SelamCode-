import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, requireUser } from "@/lib/api";
import { aggregateResearch } from "@/lib/research";
export async function GET() {
  try {
    await requireUser(true);
    const submissions = await db.submission.findMany({ include: { exercise: true, user: { select: { id: true, passwordHash: true } }, hints: { include: { feedback: true } } }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ data: aggregateResearch(submissions, process.env.RESEARCH_SALT || "") });
  } catch (error) { return apiError(error); }
}
