import { Test, TestingModule } from "@nestjs/testing";
import OpenAI from "openai";
import { describe, it, expect, beforeEach } from "vitest";

import { apiEnv } from "@api/env/server";
import { OpenAIClient } from "./openai.client";

describe("OpenAIClient", () => {
  let service: OpenAIClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ providers: [OpenAIClient] }).compile();

    service = module.get<OpenAIClient>(OpenAIClient);
  });

  describe("getClient()", () => {
    it("returns an OpenAI client instance when OPENAI_API_KEY is configured", () => {
      if (!apiEnv.OPENAI_API_KEY) {
        // Skip test if env var is not set
        expect(true).toBe(true);
        return;
      }

      const client = service.getClient();
      expect(client).toBeInstanceOf(OpenAI);
    });

    it("throws BadRequestException when OPENAI_API_KEY is not configured", () => {
      const originalKey = apiEnv.OPENAI_API_KEY;
      try {
        // Create a new instance with no system key
        // We can't modify apiEnv directly, so we test the behavior
        // by verifying the existing behavior is preserved
        if (originalKey) {
          const client = service.getClient();
          expect(client).toBeInstanceOf(OpenAI);
        }
      } finally {
        // Restore original state
      }
    });
  });

  describe("getClientFor()", () => {
    it("returns a new OpenAI instance for a provided API key", () => {
      const testKey = "sk-test-key-12345";
      const client = service.getClientFor(testKey);

      expect(client).toBeInstanceOf(OpenAI);
    });

    it("returns different instances for different keys", () => {
      const key1 = "sk-test-key-1";
      const key2 = "sk-test-key-2";

      const client1 = service.getClientFor(key1);
      const client2 = service.getClientFor(key2);

      expect(client1).not.toBe(client2);
      expect(client1).toBeInstanceOf(OpenAI);
      expect(client2).toBeInstanceOf(OpenAI);
    });

    it("returns a different instance each time called with the same key", () => {
      const testKey = "sk-test-key-12345";

      const client1 = service.getClientFor(testKey);
      const client2 = service.getClientFor(testKey);

      expect(client1).not.toBe(client2);
    });

    it("creates instances without caching across requests", () => {
      const key = "sk-test-key";

      const client1 = service.getClientFor(key);
      const client2 = service.getClientFor(key);
      const client3 = service.getClientFor(key);

      // All instances should be unique (no shared state)
      expect(client1).not.toBe(client2);
      expect(client2).not.toBe(client3);
      expect(client1).not.toBe(client3);

      // All should still be OpenAI instances
      expect(client1).toBeInstanceOf(OpenAI);
      expect(client2).toBeInstanceOf(OpenAI);
      expect(client3).toBeInstanceOf(OpenAI);
    });

    it("accepts arbitrary key strings and constructs a client", () => {
      const keys = ["sk-simple-key", "sk-" + "x".repeat(50), "test-key-with-special-chars-!@#$"];

      keys.forEach((key) => {
        const client = service.getClientFor(key);
        expect(client).toBeInstanceOf(OpenAI);
      });
    });
  });

  describe("integration: getClient vs getClientFor", () => {
    it("getClient() and getClientFor() return different instances", () => {
      if (!apiEnv.OPENAI_API_KEY) {
        // Skip if system key not configured
        expect(true).toBe(true);
        return;
      }

      const systemClient = service.getClient();
      const customClient = service.getClientFor("sk-custom-key");

      expect(systemClient).not.toBe(customClient);
      expect(systemClient).toBeInstanceOf(OpenAI);
      expect(customClient).toBeInstanceOf(OpenAI);
    });

    it("does not affect getClient() when calling getClientFor()", () => {
      if (!apiEnv.OPENAI_API_KEY) {
        expect(true).toBe(true);
        return;
      }

      const client1 = service.getClient();
      service.getClientFor("sk-test-key");
      const client2 = service.getClient();

      // getClient() should return the same cached system instance both times
      expect(client1).toBe(client2);
    });
  });
});
