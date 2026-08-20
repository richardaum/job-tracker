import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import type { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CompanyDescriptionService } from "./company-description.service";

describe("CompanyDescriptionService", () => {
  let service: CompanyDescriptionService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = {
      resolveClientAccess: vi.fn().mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey }),
    } as unknown as AiAccessService;

    service = new CompanyDescriptionService(openAIClient, promptRenderer, aiAccess, {
      record: vi.fn(),
    } as unknown as AiUsageService);
  });

  describe("generateCompanyDescription", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const input = { companyName: "Acme Corp", jobPostingContexts: [] };

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = {
        description: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A company"}]}]}',
      };

      callAiSpy.mockResolvedValue(mockResult);

      await service.generateCompanyDescription(userId, input);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "json-schema-with-web-search",
        }),
      );
    });

    it("should return empty TipTap document when description is empty", async () => {
      const userId = "user-456";
      const input = { companyName: "Unknown Corp", jobPostingContexts: [] };

      const callAiSpy = vi.spyOn(service, "callAi");
      callAiSpy.mockResolvedValue({ description: "" });

      const result = await service.generateCompanyDescription(userId, input);

      expect(result).toContain("type");
      expect(result).toContain("doc");
    });

    it("should throw BadRequestException when company name is empty", async () => {
      const userId = "user-789";
      const input = { companyName: "  ", jobPostingContexts: [] };

      await expect(service.generateCompanyDescription(userId, input)).rejects.toThrow("Company name cannot be empty.");
    });
  });
});
