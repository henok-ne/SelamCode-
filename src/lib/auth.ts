import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "./db";
import type { SessionUser } from "./types";
const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "selam_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const key = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(key, Buffer.from(hash, "hex"));
}
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.session.create({ data: { tokenHash: tokenHash(token), userId, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) } });
  return token;
}
export function sessionCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const,
    secure: process.env.SESSION_COOKIE_SECURE === "true" || (process.env.NODE_ENV === "production" && process.env.SESSION_COOKIE_SECURE !== "false"),
    path: "/", maxAge: SESSION_SECONDS };
}
export function selectUser(user: { id: string; email: string; displayName: string; role: string }): SessionUser {
  return { id: user.id, email: user.email, displayName: user.displayName, role: user.role === "instructor" ? "instructor" : "student" };
}
export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.session.findUnique({ where: { tokenHash: tokenHash(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) return null;
  return selectUser(session.user);
}
export function demoAuthEnabled() {
  return process.env.DEMO_AUTH_ENABLED === "true" && process.env.NODE_ENV !== "production";
}
