import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import type { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RewriteTextService } from "./rewrite-text.service";

describe("RewriteTextService", () => {
  let service: RewriteTextService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = {
      resolveClientAccess: vi.fn().mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey }),
    } as unknown as AiAccessService;

    service = new RewriteTextService(openAIClient, promptRenderer, aiAccess, {
      record: vi.fn(),
    } as unknown as AiUsageService);
  });

  describe("rewriteTextAsSingleParagraph", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const text = "Some text to rewrite.";

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = { rewritten: "This is the rewritten text as a single paragraph." };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.rewriteTextAsSingleParagraph(userId, text);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toBe("This is the rewritten text as a single paragraph.");
    });

    it("should include original text in user message", async () => {
      const userId = "user-456";
      const text = "This is the text I want to rewrite.";

      const callAiSpy = vi.spyOn(service, "callAi");
      callAiSpy.mockResolvedValue({ rewritten: "Rewritten" });

      await service.rewriteTextAsSingleParagraph(userId, text);

      expect(callAiSpy).toHaveBeenCalledWith(expect.objectContaining({ userMessage: expect.stringContaining(text) }));
    });
  });
});
