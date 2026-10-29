import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, demoAuthEnabled, selectUser, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { apiError, ApiError, parseBody, rateLimit } from "@/lib/api";
export async function POST(request: Request) {
  try {
    if (!demoAuthEnabled()) throw new ApiError(404, "Demo sign-in is disabled.");
    const { role } = await parseBody(request, z.object({ role: z.enum(["student", "instructor"]) }));
    rateLimit("demo-signin", 30, 600000);
    const user = await db.user.findUnique({ where: { email: `${role === "student" ? "student" : "researcher"}@selamcode.local` } });
    if (!user || !process.env.DEMO_PASSWORD || !await verifyPassword(process.env.DEMO_PASSWORD, user.passwordHash))
      throw new ApiError(503, "Demo accounts are not configured. Run the database seed first.");
    const response = NextResponse.json({ user: selectUser(user) });
    response.cookies.set(SESSION_COOKIE, await createSession(user.id), sessionCookieOptions());
    return response;
  } catch (error) { return apiError(error); }
}
