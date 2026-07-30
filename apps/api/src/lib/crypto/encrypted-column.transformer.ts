import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import type { ValueTransformer } from "typeorm";

import { apiEnv } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";

/**
 * TypeORM ValueTransformer for AES-256-GCM field-level encryption.
 * Encrypts on write (to) and decrypts on read (from) using a master key from SETTINGS_ENCRYPTION_KEY.
 * Each encryption uses a random IV, and the IV + auth tag + ciphertext are packed and base64-encoded for storage.
 */
export class EncryptedColumnTransformer implements ValueTransformer {
  private getMasterKey(): Buffer {
    // SETTINGS_ENCRYPTION_KEY is a 32-byte base64-encoded AES-256 key
    return Buffer.from(apiEnv.SETTINGS_ENCRYPTION_KEY, "base64");
  }

  /**
   * Encrypts a plaintext string using AES-256-GCM.
   * Returns base64-encoded string containing IV (12 bytes) + auth tag (16 bytes) + ciphertext.
   * Returns null unchanged.
   */
  to(value: string | null): string | null {
    if (!value) return value;

    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.getMasterKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Pack: IV (12 bytes) + auth tag (16 bytes) + ciphertext
    const packed = Buffer.concat([iv, authTag, encrypted]);
    return packed.toString("base64");
  }

  /**
   * Decrypts a base64-encoded string encrypted by to().
   * Throws on auth tag mismatch (tampered or corrupted ciphertext).
   * Returns null unchanged.
   */
  from(value: string | null): string | null {
    if (!value) return value;

    const packed = Buffer.from(value, "base64");

    // Extract: IV (first 12 bytes), auth tag (next 16 bytes), ciphertext (remainder)
    const iv = packed.subarray(0, 12);
    const authTag = packed.subarray(12, 28);
    const ciphertext = packed.subarray(28);

    const decipher = createDecipheriv("aes-256-gcm", this.getMasterKey(), iv);
    decipher.setAuthTag(authTag);

    const [err, decrypted] = tryRun(() => Buffer.concat([decipher.update(ciphertext), decipher.final()]));
    if (err) {
      throw new Error("Failed to decrypt value: auth tag mismatch or corrupted data");
    }
    return decrypted.toString("utf8");
  }
}
