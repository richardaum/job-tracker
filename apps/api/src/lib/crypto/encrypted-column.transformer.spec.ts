import { describe, expect, it, beforeEach } from "vitest";
import { EncryptedColumnTransformer } from "./encrypted-column.transformer";

describe("EncryptedColumnTransformer", () => {
  let transformer: EncryptedColumnTransformer;

  beforeEach(() => {
    transformer = new EncryptedColumnTransformer();
  });

  describe("to() — encryption", () => {
    it("encrypts a plaintext string to base64-encoded ciphertext", () => {
      const plaintext = "sk-test-123456789";

      const encrypted = transformer.to(plaintext);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      // Should be valid base64
      expect(() => Buffer.from(encrypted!, "base64")).not.toThrow();
      // Should not contain the plaintext
      expect(encrypted).not.toContain(plaintext);
    });

    it("returns null when input is null", () => {
      const result = transformer.to(null);
      expect(result).toBeNull();
    });

    it("returns empty string when input is empty string", () => {
      const result = transformer.to("");
      expect(result).toBe("");
    });

    it("encrypts the same plaintext to different ciphertexts (random IV)", () => {
      const plaintext = "sk-test-123456789";

      const encrypted1 = transformer.to(plaintext);
      const encrypted2 = transformer.to(plaintext);

      expect(encrypted1).toBeDefined();
      expect(encrypted2).toBeDefined();
      // Different IVs should produce different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe("from() — decryption", () => {
    it("decrypts a ciphertext back to the original plaintext", () => {
      const plaintext = "sk-test-123456789";
      const encrypted = transformer.to(plaintext);

      const decrypted = transformer.from(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("returns null when input is null", () => {
      const result = transformer.from(null);
      expect(result).toBeNull();
    });

    it("returns empty string when input is empty string", () => {
      const result = transformer.from("");
      expect(result).toBe("");
    });

    it("throws error on tampered ciphertext (flipped byte)", () => {
      const plaintext = "sk-test-123456789";
      const encrypted = transformer.to(plaintext);

      // Tamper with the ciphertext by flipping a bit at the end
      const buffer = Buffer.from(encrypted!, "base64");
      // Flip a byte in the ciphertext part (after the 28-byte IV+tag header)
      if (buffer.length > 28) {
        buffer[buffer.length - 1] = buffer[buffer.length - 1] ^ 0x01; // Flip one bit
      }
      const tampered = buffer.toString("base64");

      expect(() => transformer.from(tampered)).toThrow();
    });

    it("throws error on invalid base64", () => {
      expect(() => transformer.from("not-valid-base64!!!")).toThrow();
    });

    it("throws error on truncated ciphertext", () => {
      const plaintext = "sk-test-123456789";
      const encrypted = transformer.to(plaintext);

      // Truncate the base64 string to make it too short
      const truncated = encrypted!.substring(0, 10);

      expect(() => transformer.from(truncated)).toThrow();
    });
  });

  describe("round-trip — encryption and decryption", () => {
    it("encrypts then decrypts returns original value", () => {
      const plaintext = "sk-test-123456789";

      const encrypted = transformer.to(plaintext);
      const decrypted = transformer.from(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("handles various string types: short, long, special characters", () => {
      const testCases = [
        "a",
        "sk-test-1",
        "sk-test-123456789abcdefghijklmnop",
        "key!@#$%^&*()",
        "key with spaces",
        "key\nwith\nnewlines",
        "key\twith\ttabs",
        "🔑 emoji key",
      ];

      for (const plaintext of testCases) {
        const encrypted = transformer.to(plaintext);
        const decrypted = transformer.from(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });

    it("handles multiple consecutive encryptions and decryptions", () => {
      const plaintexts = ["first-key", "second-key", "third-key"];

      for (const plaintext of plaintexts) {
        const encrypted = transformer.to(plaintext);
        const decrypted = transformer.from(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });
  });

  describe("null pass-through — both directions", () => {
    it("to(null) returns null", () => {
      expect(transformer.to(null)).toBeNull();
    });

    it("from(null) returns null", () => {
      expect(transformer.from(null)).toBeNull();
    });

    it("to(undefined) returns undefined (falsy value)", () => {
      // TypeScript doesn't allow undefined at runtime, but test the truthy/falsy behavior
      expect(transformer.to(undefined as unknown as string)).toBeUndefined();
    });

    it("from(undefined) returns undefined (falsy value)", () => {
      expect(transformer.from(undefined as unknown as string)).toBeUndefined();
    });
  });
});
