import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { encrypt, decrypt } from "./encryption";

const VALID_KEY = "a".repeat(64); // 64 hex chars = 32 bytes

describe("encrypt / decrypt", () => {
  const origKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = VALID_KEY;
  });
  afterEach(() => {
    process.env.ENCRYPTION_KEY = origKey;
  });

  it("round-trips plaintext", () => {
    const plain = "hello world";
    expect(decrypt(encrypt(plain))).toBe(plain);
  });

  it("produces colon-separated 3-part ciphertext", () => {
    const parts = encrypt("test").split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toMatch(/^[0-9a-f]+$/); // iv hex
    expect(parts[1]).toMatch(/^[0-9a-f]+$/); // authTag hex
    expect(parts[2]).toMatch(/^[0-9a-f]+$/); // ciphertext hex
  });

  it("each call produces a unique ciphertext (random IV)", () => {
    const c1 = encrypt("same");
    const c2 = encrypt("same");
    expect(c1).not.toBe(c2);
  });

  it("throws on tampered auth tag", () => {
    const parts = encrypt("sensitive").split(":");
    // Flip a byte in the auth tag
    const tampered = parts[1]!.replace(/^(.{2})/, (_, h) =>
      (parseInt(h, 16) ^ 0xff).toString(16).padStart(2, "0")
    );
    expect(() => decrypt([parts[0], tampered, parts[2]].join(":"))).toThrow(
      /authentication tag mismatch/
    );
  });

  it("throws on invalid ciphertext format", () => {
    expect(() => decrypt("notvalid")).toThrow(/Invalid ciphertext format/);
    expect(() => decrypt("a:b")).toThrow(/Invalid ciphertext format/);
  });

  it("throws when ENCRYPTION_KEY is not valid hex", () => {
    process.env.ENCRYPTION_KEY = "z".repeat(64); // not hex
    expect(() => encrypt("x")).toThrow(/exactly 64 hex characters/);
  });

  it("throws when ENCRYPTION_KEY is too short", () => {
    process.env.ENCRYPTION_KEY = "a".repeat(32); // only 32 chars
    expect(() => encrypt("x")).toThrow(/exactly 64 hex characters/);
  });

  it("throws when ENCRYPTION_KEY is missing", () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt("x")).toThrow(/exactly 64 hex characters/);
  });

  it("decrypts using ENCRYPTION_KEY_PREVIOUS after key rotation", () => {
    const oldKey = "b".repeat(64);
    process.env.ENCRYPTION_KEY = oldKey;
    const cipher = encrypt("rotate me");

    // Rotate to new key
    const newKey = "c".repeat(64);
    process.env.ENCRYPTION_KEY = newKey;
    process.env.ENCRYPTION_KEY_PREVIOUS = oldKey;

    expect(decrypt(cipher)).toBe("rotate me");
    delete process.env.ENCRYPTION_KEY_PREVIOUS;
  });
});
