import { afterAll, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const testDbPath = path.resolve(__dirname, "test.db");
process.env.DATABASE_URL = `file:${testDbPath}`;
process.env.RESEARCH_SALT = "test-salt-not-for-production";
process.env.SESSION_COOKIE_SECURE = "false";

beforeAll(() => {
  if (existsSync(testDbPath)) rmSync(testDbPath);
  execSync("npx prisma migrate deploy", { cwd: path.resolve(__dirname, ".."), env: { ...process.env }, stdio: "pipe" });
});

afterAll(() => {
  if (existsSync(testDbPath)) rmSync(testDbPath);
  for (const suffix of ["-journal", "-wal", "-shm"]) {
    const extra = testDbPath + suffix;
    if (existsSync(extra)) rmSync(extra);
  }
});
