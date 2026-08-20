import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import type { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NoteGenerationService } from "./note-generation.service";

describe("NoteGenerationService", () => {
  let service: NoteGenerationService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = {
      resolveClientAccess: vi.fn().mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey }),
    } as unknown as AiAccessService;

    service = new NoteGenerationService(openAIClient, promptRenderer, aiAccess, {
      record: vi.fn(),
    } as unknown as AiUsageService);
  });

  describe("generateNote", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const input = { description: "Test job description", note: "Test note content" };

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = { sections: [{ heading: "Skills", bullets: ["React", "TypeScript"] }] };

      callAiSpy.mockResolvedValue(mockResult);

      await service.generateNote(userId, input);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "json-schema",
        }),
      );
    });

    it("should throw error when sections are empty", async () => {
      const userId = "user-123";
      const input = { description: "Test job description", note: "Test note content" };

      const callAiSpy = vi.spyOn(service, "callAi");
      callAiSpy.mockResolvedValue({ sections: [] });

      await expect(service.generateNote(userId, input)).rejects.toThrow("Failed to generate note.");
    });
  });

  describe("rewriteTextAsSingleParagraph", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-456";
      const input = { description: "Test job description", text: "Test text content" };

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = { rewritten: "This is rewritten text as a single paragraph." };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.rewriteTextAsSingleParagraph(userId, input);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toBe("This is rewritten text as a single paragraph.");
    });
  });
});
