import { describe, expect, it } from "vitest";
import { credentialsSchema, registerSchema, runSchema, hintSchema, feedbackSchema } from "@/lib/validation";

describe("credentialsSchema", () => {
  it("normalizes email to lowercase", () => {
    const result = credentialsSchema.parse({ email: "Student@Example.COM", password: "longenough1" });
    expect(result.email).toBe("student@example.com");
  });
  it("rejects a password shorter than 8 characters", () => {
    expect(() => credentialsSchema.parse({ email: "a@b.com", password: "short" })).toThrow();
  });
  it("rejects an invalid email", () => {
    expect(() => credentialsSchema.parse({ email: "not-an-email", password: "longenough1" })).toThrow();
  });
});

describe("registerSchema", () => {
  it("defaults role to student when omitted", () => {
    const result = registerSchema.parse({ email: "a@b.com", password: "longenough1", displayName: "Abel" });
    expect(result.role).toBe("student");
  });
  it("rejects a display name that is too short", () => {
    expect(() => registerSchema.parse({ email: "a@b.com", password: "longenough1", displayName: "A" })).toThrow();
  });
});

describe("runSchema", () => {
  it("defaults submit to false", () => {
    const result = runSchema.parse({ exerciseSlug: "fizzbuzz", code: "def fizzbuzz(n): pass" });
    expect(result.submit).toBe(false);
  });
  it("rejects empty code", () => {
    expect(() => runSchema.parse({ exerciseSlug: "fizzbuzz", code: "" })).toThrow();
  });
  it("rejects code over the length limit", () => {
    expect(() => runSchema.parse({ exerciseSlug: "fizzbuzz", code: "x".repeat(20001) })).toThrow();
  });
});

describe("hintSchema", () => {
  it("rejects an invalid hint level", () => {
    expect(() => hintSchema.parse({ submissionId: "clxxxxxxxxxxxxxxxxxxxxxxxx", hintLevel: "solution", category: "debugging" })).toThrow();
  });
  it("rejects a non-cuid submission id", () => {
    expect(() => hintSchema.parse({ submissionId: "not-a-cuid", hintLevel: "understand", category: "debugging" })).toThrow();
  });
});

describe("feedbackSchema", () => {
  it("accepts a rating without a comment", () => {
    const result = feedbackSchema.parse({ rating: true });
    expect(result.rating).toBe(true);
  });
  it("rejects a comment over the length limit", () => {
    expect(() => feedbackSchema.parse({ rating: false, comment: "x".repeat(1001) })).toThrow();
  });
});
