import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, tokenHash, selectUser } from "@/lib/auth";

describe("password hashing", () => {
  it("round-trips a correct password", async () => {
    const hash = await hashPassword("a-real-password-123");
    expect(await verifyPassword("a-real-password-123", hash)).toBe(true);
  });
  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("a-real-password-123");
    expect(await verifyPassword("the-wrong-password", hash)).toBe(false);
  });
  it("never stores the password in plain text", async () => {
    const hash = await hashPassword("a-real-password-123");
    expect(hash).not.toContain("a-real-password-123");
    expect(hash.startsWith("scrypt:")).toBe(true);
  });
  it("rejects a malformed stored hash instead of throwing", async () => {
    expect(await verifyPassword("anything", "not-a-valid-hash")).toBe(false);
  });
});

describe("tokenHash", () => {
  it("is deterministic for the same token", () => {
    expect(tokenHash("same-token")).toBe(tokenHash("same-token"));
  });
  it("differs for different tokens", () => {
    expect(tokenHash("token-a")).not.toBe(tokenHash("token-b"));
  });
});

describe("selectUser", () => {
  it("never leaks the password hash and defaults unknown roles to student", () => {
    const user = selectUser({ id: "1", email: "a@b.com", displayName: "Abel", role: "superadmin", passwordHash: "secret" } as never);
    expect(user).not.toHaveProperty("passwordHash");
    expect(user.role).toBe("student");
  });
  it("preserves the instructor role", () => {
    const user = selectUser({ id: "1", email: "a@b.com", displayName: "Abel", role: "instructor", passwordHash: "secret" } as never);
    expect(user.role).toBe("instructor");
  });
});
