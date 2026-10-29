import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
try { process.loadEnvFile(); } catch { /* Environment may already be supplied by the host. */ }
export default defineConfig({
  schema: "prisma/schema.prisma",
  experimental: { adapter: true },
  engine: "js",
  adapter: async () => new PrismaLibSQL({ url: process.env.DATABASE_URL || "file:./prisma/dev.db" }),
  migrations: { path: "prisma/migrations", seed: "node prisma/seed.mjs" },
});
