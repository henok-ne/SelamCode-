import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword, selectUser, verifyPassword, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { apiError, ApiError, parseBody, rateLimit } from "@/lib/api";
import { credentialsSchema } from "@/lib/validation";
const dummyHash = hashPassword("not-a-real-account-password");
export async function POST(request: Request) {
  try {
    const body = await parseBody(request, credentialsSchema);
    rateLimit(`login:${body.email}`, 12, 600000);
    rateLimit(`login-ip:${request.headers.get("x-forwarded-for") || "local"}`, 40, 600000);
    const user = await db.user.findUnique({ where: { email: body.email } });
    const valid = await verifyPassword(body.password, user?.passwordHash || await dummyHash);
    if (!user || !valid) throw new ApiError(401, "That email and password do not match.");
    const token = await createSession(user.id);
    const response = NextResponse.json({ user: selectUser(user) });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) { return apiError(error); }
}
