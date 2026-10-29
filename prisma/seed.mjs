import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
try { process.loadEnvFile(); } catch { /* supplied environment */ }
import { readFile } from 'node:fs/promises';
import { randomBytes, scryptSync } from 'node:crypto';
const db = new PrismaClient({ adapter: new PrismaLibSQL({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' }) });
const exercises = JSON.parse(await readFile(new URL('../src/data/exercises.json', import.meta.url), 'utf8'));
try {
  for (const exercise of exercises) {
    const data = {
      title: exercise.title, slug: exercise.slug, difficulty: exercise.difficulty,
      description: exercise.description, starterCode: exercise.starterCode,
      expectedOutput: exercise.expectedOutput, functionName: exercise.functionName,
      testCasesJson: JSON.stringify(exercise.testCases), conceptTagsJson: JSON.stringify(exercise.conceptTags),
    };
    await db.exercise.upsert({ where: { slug: exercise.slug }, create: data, update: data });
  }
  console.log(`Seeded ${exercises.length} exercises. No fabricated activity was created.`);
  if (process.env.SEED_DEMO_ACCOUNTS === 'true') {
    if (process.env.DEMO_AUTH_ENABLED !== 'true') throw new Error('Demo accounts require DEMO_AUTH_ENABLED=true.');
    const password = process.env.DEMO_PASSWORD;
    if (!password || password.length < 12) throw new Error('Set DEMO_PASSWORD to at least 12 characters.');
    for (const [email, displayName, role] of [
      ['student@selamcode.local', 'Demo student', 'student'],
      ['researcher@selamcode.local', 'Demo researcher', 'instructor'],
    ]) {
      const salt = randomBytes(16).toString('hex');
      const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
      await db.user.upsert({ where: { email }, create: { email, displayName, role, passwordHash }, update: {} });
    }
    console.log('Explicit local demo accounts seeded. Never expose demo authentication publicly.');
  }
} finally { await db.$disconnect(); }
