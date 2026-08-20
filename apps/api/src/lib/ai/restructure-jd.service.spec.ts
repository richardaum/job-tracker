import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import type { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RestructureJDService } from "./restructure-jd.service";

describe("RestructureJDService", () => {
  let service: RestructureJDService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = {
      resolveClientAccess: vi.fn().mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey }),
    } as unknown as AiAccessService;

    service = new RestructureJDService(openAIClient, promptRenderer, aiAccess, {
      record: vi.fn(),
    } as unknown as AiUsageService);
  });

  describe("restructureJobDescription", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const text = "Job description to restructure.";

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = { restructured: "ROLE OVERVIEW\n- Key responsibility 1\n- Key responsibility 2" };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.restructureJobDescription(userId, text);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toContain("ROLE OVERVIEW");
    });

    it("should include original text in user message", async () => {
      const userId = "user-456";
      const text = "Job posting content here.";

      const callAiSpy = vi.spyOn(service, "callAi");
      callAiSpy.mockResolvedValue({ restructured: "Restructured content" });

      await service.restructureJobDescription(userId, text);

      expect(callAiSpy).toHaveBeenCalledWith(expect.objectContaining({ userMessage: expect.stringContaining(text) }));
    });
  });
});
