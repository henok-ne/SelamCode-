import { NextResponse } from "next/server";
import { ZodError, type ZodType, type output } from "zod";
import { getUser } from "./auth";
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function requireUser(instructor = false) {
  const user = await getUser();
  if (!user) throw new ApiError(401, "Please sign in to continue.");
  if (instructor && user.role !== "instructor") throw new ApiError(403, "This research view is for instructors.");
  return user;
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return; // Non-browser clients still need a valid session cookie.
  const allowed = new Set([new URL(request.url).origin]);
  if (process.env.APP_URL) allowed.add(new URL(process.env.APP_URL).origin);
  // Reverse proxies keep the public Host header; Next's request URL may use the bind address.
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
  if (host) allowed.add(`${protocol}://${host}`);
  if (!allowed.has(origin)) throw new ApiError(403, "This request came from an untrusted origin.");
}
export async function parseBody<T extends ZodType>(request: Request, schema: T): Promise<output<T>> {
  assertSameOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "Send a JSON request.");
  const text = await request.text();
  if (text.length > 60000) throw new ApiError(413, "This request is too large.");
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new ApiError(400, "The request contains invalid JSON."); }
  return schema.parse(body);
}
export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Check your input.", issues: error.flatten() }, { status: 400 });
  console.error("Request failed:", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "Something went wrong. Your work is safe; please try again." }, { status: 500 });
}
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 30, windowMs = 60000) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [name, value] of buckets) if (value.reset < now) buckets.delete(name);
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) { buckets.set(key, { count: 1, reset: now + windowMs }); return; }
  bucket.count++;
  if (bucket.count > limit) throw new ApiError(429, "A short pause helps. Please try again in a minute.");
}
