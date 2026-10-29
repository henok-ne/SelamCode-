import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { createSession, hashPassword, selectUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { apiError, ApiError, parseBody, rateLimit } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
export async function POST(request: Request) {
  try {
    const body = await parseBody(request, registerSchema);
    rateLimit(`register:${request.headers.get("x-forwarded-for") || "local"}`, 8, 600000);
    if (body.role === "instructor") {
      const expected = process.env.INSTRUCTOR_INVITE_CODE || "";
      const supplied = body.inviteCode || "";
      if (expected.length < 8 || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
        throw new ApiError(403, "Ask your research administrator for a valid instructor invite code.");
    }
    if (await db.user.findUnique({ where: { email: body.email } })) throw new ApiError(409, "An account with this email already exists. Try signing in.");
    const user = await db.user.create({ data: { email: body.email, displayName: body.displayName, role: body.role, passwordHash: await hashPassword(body.password) } });
    const token = await createSession(user.id);
    const response = NextResponse.json({ user: selectUser(user) }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) { return apiError(error); }
}
