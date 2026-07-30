import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";
import { DraftExtractionService } from "./draft-extraction.service";

describe("DraftExtractionService", () => {
  let service: DraftExtractionService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;
  let normalizationService: DraftExtractionNormalizationService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = { resolveClientKey: vi.fn() } as unknown as AiAccessService;

    normalizationService = {} as unknown as DraftExtractionNormalizationService;

    service = new DraftExtractionService(openAIClient, promptRenderer, aiAccess, normalizationService);
  });

  describe("extract", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const input = {
        title: "Senior Engineer",
        url: "https://example.com/job",
        htmlContent: "<html>Job posting</html>",
      };

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = {
        title: "Senior Engineer",
        company: "Example Corp",
        url: "https://example.com/job",
        description: "Hiring a senior engineer",
        salary: { minCents: 10000000, maxCents: 15000000, currency: "USD", period: "yearly" },
        tags: ["react", "typescript"],
        location: "San Francisco",
        workRegion: "US",
      };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.extract(userId, input);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it("should throw error when draft has no usable content", async () => {
      const userId = "user-123";
      const input = { title: "", url: null, htmlContent: "" };

      await expect(service.extract(userId, input)).rejects.toThrow(BadRequestException);
    });

    it("should accept draft with title only", async () => {
      const userId = "user-123";
      const input = { title: "Senior Engineer", url: null, htmlContent: "" };

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = {
        title: "Senior Engineer",
        company: "Example Corp",
        url: null,
        description: "Hiring a senior engineer",
        salary: null,
        tags: [],
        location: null,
        workRegion: null,
      };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.extract(userId, input);

      expect(callAiSpy).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
