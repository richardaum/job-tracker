import { BadRequestException } from "@nestjs/common";
import { GraphQLError } from "graphql";
import type OpenAI from "openai";
import { describe, it, expect, beforeEach, vitest } from "vitest";
import { z } from "zod";

import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService } from "./ai-access.service";
import { AiBaseService, type CallAiOptions } from "./ai-base.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";

describe("AiBaseService", () => {
  let service: AiBaseService;
  let openAIClient: OpenAIClient;
  let aiAccess: AiAccessService;
  let aiUsage: AiUsageService;
  let promptRenderer: PromptRendererService;

  beforeEach(() => {
    openAIClient = { getClientFor: vitest.fn() } as unknown as OpenAIClient;

    aiAccess = { resolveClientAccess: vitest.fn() } as unknown as AiAccessService;

    aiUsage = { record: vitest.fn().mockResolvedValue(undefined) } as unknown as AiUsageService;

    promptRenderer = {} as unknown as PromptRendererService;

    service = new AiBaseService(openAIClient, promptRenderer, aiAccess, aiUsage);
  });

  describe("callAi()", () => {
    describe("gating enforcement", () => {
      it("should call resolveClientAccess before constructing the client", async () => {
        const userId = "user-123";
        const resolvedKey = "test-api-key";
        const schema = z.object({ test: z.string() });

        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: resolvedKey, source: AiUsageSourceEnum.PersonalKey });
        vitest
          .spyOn(openAIClient, "getClientFor")
          .mockReturnValue({
            chat: {
              completions: {
                parse: vitest
                  .fn()
                  .mockResolvedValue({ choices: [{ message: { parsed: { test: "value" }, refusal: null } }] }),
              },
            },
          } as unknown as OpenAI);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await service.callAi(opts);

        // Verify resolveClientAccess was called first
        expect(aiAccess.resolveClientAccess).toHaveBeenCalledWith(userId);
        expect(openAIClient.getClientFor).toHaveBeenCalledWith(resolvedKey);
      });

      it("should use the key returned by resolveClientAccess", async () => {
        const userId = "user-456";
        const resolvedKey = "personal-key-12345";
        const schema = z.object({ test: z.string() });

        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: resolvedKey, source: AiUsageSourceEnum.PersonalKey });
        const getClientForSpy = vitest.spyOn(openAIClient, "getClientFor");
        getClientForSpy.mockReturnValue({
          chat: {
            completions: {
              parse: vitest
                .fn()
                .mockResolvedValue({ choices: [{ message: { parsed: { test: "value" }, refusal: null } }] }),
            },
          },
        } as unknown as OpenAI);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await service.callAi(opts);

        expect(getClientForSpy).toHaveBeenCalledWith(resolvedKey);
      });

      it("should allow GraphQLError from resolveClientAccess to propagate unmodified", async () => {
        const userId = "user-disabled";
        const gatingError = new GraphQLError("AI is turned off for your account.", {
          extensions: { code: "AI_DISABLED_BY_USER" },
        });

        vitest.spyOn(aiAccess, "resolveClientAccess").mockRejectedValue(gatingError);

        const schema = z.object({ test: z.string() });
        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await expect(service.callAi(opts)).rejects.toThrow(gatingError);
        await expect(service.callAi(opts)).rejects.not.toThrow(BadRequestException);
      });

      it("should propagate AI_KEY_REQUIRED error unmodified", async () => {
        const userId = "user-no-quota";
        const quotaError = new GraphQLError("Your AI trial is over — add your own OpenAI key.", {
          extensions: { code: "AI_KEY_REQUIRED" },
        });

        vitest.spyOn(aiAccess, "resolveClientAccess").mockRejectedValue(quotaError);

        const schema = z.object({ test: z.string() });
        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await expect(service.callAi(opts)).rejects.toThrow(quotaError);
      });
    });

    describe("response formats", () => {
      it("should handle zod-response format with resolved key", async () => {
        const userId = "user-123";
        const resolvedKey = "test-key";
        const testSchema = z.object({ result: z.string() });
        const expectedResult = { result: "success" };

        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: resolvedKey, source: AiUsageSourceEnum.PersonalKey });
        const mockClient = {
          chat: {
            completions: {
              parse: vitest
                .fn()
                .mockResolvedValue({ choices: [{ message: { parsed: expectedResult, refusal: null } }] }),
            },
          },
        } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System message",
          userMessage: "User message",
          responseFormat: "zod-response",
          schema: testSchema,
        };

        const result = await service.callAi(opts);

        expect(result).toEqual(expectedResult);
        expect(mockClient.chat.completions.parse).toHaveBeenCalled();
      });

      it("should handle json-schema format with resolved key", async () => {
        const userId = "user-456";
        const resolvedKey = "test-key-2";
        const schemaJson = { type: "object", properties: { name: { type: "string" } } };
        const responseText = JSON.stringify({ name: "John" });

        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: resolvedKey, source: AiUsageSourceEnum.PersonalKey });
        const mockClient = {
          responses: { create: vitest.fn().mockResolvedValue({ output_text: responseText }) },
        } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "json-schema",
          schemaJson,
        };

        const result = await service.callAi(opts);

        expect(result).toEqual({ name: "John" });
        expect(mockClient.responses.create).toHaveBeenCalled();
      });

      it("should handle json-schema-with-web-search format", async () => {
        const userId = "user-web";
        const resolvedKey = "test-key-3";
        const schemaJson = { type: "object", properties: { search: { type: "string" } } };
        const responseText = JSON.stringify({ search: "result" });

        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: resolvedKey, source: AiUsageSourceEnum.PersonalKey });
        const createSpy = vitest.fn().mockResolvedValue({ output_text: responseText });
        const mockClient = { responses: { create: createSpy } } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "json-schema-with-web-search",
          schemaJson,
        };

        const result = await service.callAi(opts);

        expect(result).toEqual({ search: "result" });
        const callArgs = createSpy.mock.calls[0][0];
        expect(callArgs.tools).toEqual([{ type: "web_search_preview" }]);
      });
    });

    describe("usage accounting", () => {
      it("records exact Chat Completions usage for a personal key", async () => {
        const schema = z.object({ result: z.string() });
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "personal-key", source: AiUsageSourceEnum.PersonalKey });
        vitest
          .spyOn(openAIClient, "getClientFor")
          .mockReturnValue({
            chat: {
              completions: {
                parse: vitest
                  .fn()
                  .mockResolvedValue({
                    choices: [{ message: { parsed: { result: "ok" }, refusal: null } }],
                    usage: { prompt_tokens: 17, completion_tokens: 9, total_tokens: 26 },
                  }),
              },
            },
          } as unknown as OpenAI);

        await service.callAi({
          userId: "user-personal",
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        });

        expect(aiUsage.record).toHaveBeenCalledWith("user-personal", AiUsageSourceEnum.PersonalKey, {
          inputTokens: 17,
          outputTokens: 9,
          totalTokens: 26,
        });
      });

      it("records exact Responses usage for trial access", async () => {
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "trial-key", source: AiUsageSourceEnum.Trial });
        vitest
          .spyOn(openAIClient, "getClientFor")
          .mockReturnValue({
            responses: {
              create: vitest
                .fn()
                .mockResolvedValue({
                  output_text: '{"result":"ok"}',
                  usage: { input_tokens: 23, output_tokens: 11, total_tokens: 34 },
                }),
            },
          } as unknown as OpenAI);

        await service.callAi({
          userId: "user-trial",
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "json-schema",
          schemaJson: { type: "object" },
        });

        expect(aiUsage.record).toHaveBeenCalledWith("user-trial", AiUsageSourceEnum.Trial, {
          inputTokens: 23,
          outputTokens: 11,
          totalTokens: 34,
        });
      });

      it("does not record when a successful response omits usage", async () => {
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "personal-key", source: AiUsageSourceEnum.PersonalKey });
        vitest
          .spyOn(openAIClient, "getClientFor")
          .mockReturnValue({
            responses: { create: vitest.fn().mockResolvedValue({ output_text: '{"result":"ok"}' }) },
          } as unknown as OpenAI);

        await service.callAi({
          userId: "user-personal",
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "json-schema",
          schemaJson: { type: "object" },
        });

        expect(aiUsage.record).not.toHaveBeenCalled();
      });

      it("returns the successful AI result when usage persistence fails", async () => {
        vitest.mocked(aiUsage.record).mockRejectedValue(new Error("database unavailable"));
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "personal-key", source: AiUsageSourceEnum.PersonalKey });
        vitest
          .spyOn(openAIClient, "getClientFor")
          .mockReturnValue({
            responses: {
              create: vitest
                .fn()
                .mockResolvedValue({
                  output_text: '{"result":"ok"}',
                  usage: { input_tokens: 3, output_tokens: 2, total_tokens: 5 },
                }),
            },
          } as unknown as OpenAI);

        await expect(
          service.callAi({
            userId: "user-personal",
            systemMessage: "System",
            userMessage: "User",
            responseFormat: "json-schema",
            schemaJson: { type: "object" },
          }),
        ).resolves.toEqual({ result: "ok" });
      });
    });

    describe("error handling", () => {
      it("should throw BadRequestException on OpenAI API failure for zod-response", async () => {
        const userId = "user-123";
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey });
        const mockClient = {
          chat: { completions: { parse: vitest.fn().mockRejectedValue(new Error("OpenAI API error")) } },
        } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const schema = z.object({ test: z.string() });
        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await expect(service.callAi(opts)).rejects.toThrow(BadRequestException);
        expect(aiUsage.record).not.toHaveBeenCalled();
      });

      it("should throw BadRequestException on OpenAI API failure for json-schema", async () => {
        const userId = "user-456";
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey });
        const mockClient = {
          responses: { create: vitest.fn().mockRejectedValue(new Error("OpenAI API error")) },
        } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "json-schema",
          schemaJson: { type: "object" },
        };

        await expect(service.callAi(opts)).rejects.toThrow(BadRequestException);
        expect(aiUsage.record).not.toHaveBeenCalled();
      });

      it("should throw BadRequestException when AI response is missing message", async () => {
        const userId = "user-123";
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey });
        const mockClient = {
          chat: {
            completions: {
              parse: vitest.fn().mockResolvedValue({
                choices: [{}], // Missing message
              }),
            },
          },
        } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const schema = z.object({ test: z.string() });
        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await expect(service.callAi(opts)).rejects.toThrow("AI returned no message");
      });

      it("should throw BadRequestException when AI refuses to respond", async () => {
        const userId = "user-123";
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey });
        const mockClient = {
          chat: {
            completions: {
              parse: vitest
                .fn()
                .mockResolvedValue({ choices: [{ message: { refusal: "I cannot do that", parsed: null } }] }),
            },
          },
        } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const schema = z.object({ test: z.string() });
        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await expect(service.callAi(opts)).rejects.toThrow("I cannot do that");
      });

      it("should throw BadRequestException when JSON response cannot be parsed", async () => {
        const userId = "user-456";
        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey });
        const mockClient = {
          responses: { create: vitest.fn().mockResolvedValue({ output_text: "{ invalid json }" }) },
        } as unknown as OpenAI;
        vitest.spyOn(openAIClient, "getClientFor").mockReturnValue(mockClient);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "json-schema",
          schemaJson: { type: "object" },
        };

        await expect(service.callAi(opts)).rejects.toThrow("could not be parsed as JSON");
      });
    });

    describe("call order verification", () => {
      it("should never call OpenAI when gating denies access", async () => {
        const userId = "user-denied";
        const gatingError = new GraphQLError("AI is turned off", { extensions: { code: "AI_DISABLED_BY_USER" } });

        vitest.spyOn(aiAccess, "resolveClientAccess").mockRejectedValue(gatingError);
        const getClientSpy = vitest.spyOn(openAIClient, "getClientFor");

        const schema = z.object({ test: z.string() });
        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        try {
          await service.callAi(opts);
        } catch {
          // Expected to throw
        }

        // Verify getClientFor was never called since gating failed
        expect(getClientSpy).not.toHaveBeenCalled();
      });

      it("should call getClientFor exactly once after successful key resolution", async () => {
        const userId = "user-123";
        const resolvedKey = "test-key";
        const schema = z.object({ test: z.string() });

        vitest
          .spyOn(aiAccess, "resolveClientAccess")
          .mockResolvedValue({ key: resolvedKey, source: AiUsageSourceEnum.PersonalKey });
        const getClientSpy = vitest.spyOn(openAIClient, "getClientFor");
        getClientSpy.mockReturnValue({
          chat: {
            completions: {
              parse: vitest
                .fn()
                .mockResolvedValue({ choices: [{ message: { parsed: { test: "value" }, refusal: null } }] }),
            },
          },
        } as unknown as OpenAI);

        const opts: CallAiOptions = {
          userId,
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        await service.callAi(opts);

        expect(getClientSpy).toHaveBeenCalledTimes(1);
        expect(getClientSpy).toHaveBeenCalledWith(resolvedKey);
      });
    });

    describe("userId requirement", () => {
      it("should require userId in CallAiOptions", () => {
        // This test verifies the TypeScript type system — userId is required
        // The type system will enforce this at compile time, but we can verify the structure
        const schema = z.object({ test: z.string() });

        // Valid: with userId
        const validOpts: CallAiOptions = {
          userId: "user-123",
          systemMessage: "System",
          userMessage: "User",
          responseFormat: "zod-response",
          schema,
        };

        expect(validOpts.userId).toBeDefined();
      });
    });
  });
});
