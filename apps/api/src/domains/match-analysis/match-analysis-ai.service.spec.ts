import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import type { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { WeightEnum } from "@api/domains/work-preferences/weight.enum";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PreferenceItem } from "@api/database/entities/work-preferences.entity";
import { MatchAnalysisAiService } from "./match-analysis-ai.service";

describe("MatchAnalysisAiService", () => {
  let service: MatchAnalysisAiService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = {
      resolveClientAccess: vi.fn().mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey }),
    } as unknown as AiAccessService;

    service = new MatchAnalysisAiService(openAIClient, promptRenderer, aiAccess, {
      record: vi.fn(),
    } as unknown as AiUsageService);
  });

  describe("extractResumeMatchItems", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const jdText = "Senior Engineer role requiring 5+ years experience";
      const resumeText = "5 years of software engineering experience";

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = {
        items: [
          {
            requirement: "5+ years experience",
            type: "experience",
            verdict: "match",
            jdQuote: "5+ years experience",
            sourceQuotes: ["5 years of software engineering"],
            suggestion: null,
          },
        ],
      };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.extractResumeMatchItems(userId, jdText, resumeText);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("extractPreferenceMatchItems", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-456";
      const jdText = "Remote position in San Francisco area";
      const preferences: PreferenceItem[] = [{ text: "Prefer remote work", weight: WeightEnum.High }];

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = {
        items: [
          {
            requirement: "Remote position",
            type: "location",
            verdict: "match",
            jdQuote: "Remote position",
            suggestion: null,
          },
        ],
      };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.extractPreferenceMatchItems(userId, jdText, preferences);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no preferences", async () => {
      const userId = "user-456";
      const jdText = "Job description";
      const preferences: PreferenceItem[] = [];

      const result = await service.extractPreferenceMatchItems(userId, jdText, preferences);

      expect(result).toEqual([]);
    });
  });
});
