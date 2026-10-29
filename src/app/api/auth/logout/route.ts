import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, tokenHash } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/api";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
    return response;
  } catch (error) { return apiError(error); }
}
