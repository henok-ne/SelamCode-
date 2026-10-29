import { z } from "zod";
import { CATEGORIES, HINT_LEVELS } from "./types";
export const codeSchema = z.string().min(1, "Write some code first.").max(20000, "Keep your code under 20,000 characters.");
export const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});
export const registerSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(2).max(50),
  role: z.enum(["student", "instructor"]).default("student"),
  inviteCode: z.string().max(128).optional(),
});
export const runSchema = z.object({ exerciseSlug: z.string().max(100), code: codeSchema, submit: z.boolean().default(false) });
export const hintSchema = z.object({
  submissionId: z.string().cuid(), hintLevel: z.enum(HINT_LEVELS), category: z.enum(CATEGORIES),
  language: z.enum(["en", "am"]).default("en"), learnerLevel: z.enum(["new", "some", "confident"]).default("new"),
});
export const feedbackSchema = z.object({ rating: z.boolean(), comment: z.string().trim().max(1000).optional() });
