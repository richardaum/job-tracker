import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import type { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SummaryAiService } from "./summary-ai.service";

describe("SummaryAiService", () => {
  let service: SummaryAiService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = {
      resolveClientAccess: vi.fn().mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey }),
    } as unknown as AiAccessService;

    service = new SummaryAiService(openAIClient, promptRenderer, aiAccess, {
      record: vi.fn(),
    } as unknown as AiUsageService);
  });

  describe("generateSummary", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const context = "Senior Engineer role at Example Corp. Stage: technical screen.";

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = {
        summary:
          "This is a senior engineering role at an established tech company. Progressed to technical evaluation.",
      };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.generateSummary(userId, context);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "json-schema",
        }),
      );
      expect(result).toBe(
        "This is a senior engineering role at an established tech company. Progressed to technical evaluation.",
      );
    });

    it("should extract summary from response", async () => {
      const userId = "user-456";
      const context = "Junior role with learning opportunity";

      const callAiSpy = vi.spyOn(service, "callAi");
      callAiSpy.mockResolvedValue({ summary: "Entry-level position focused on skill development." });

      const result = await service.generateSummary(userId, context);

      expect(result).toBe("Entry-level position focused on skill development.");
    });
  });
});
