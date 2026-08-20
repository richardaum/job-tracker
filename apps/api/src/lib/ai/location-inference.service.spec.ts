import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import type { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocationInferenceService } from "./location-inference.service";

describe("LocationInferenceService", () => {
  let service: LocationInferenceService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = {
      resolveClientAccess: vi.fn().mockResolvedValue({ key: "test-key", source: AiUsageSourceEnum.PersonalKey }),
    } as unknown as AiAccessService;

    service = new LocationInferenceService(openAIClient, promptRenderer, aiAccess, {
      record: vi.fn(),
    } as unknown as AiUsageService);
  });

  describe("inferLocation", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const description = "We're hiring in New York.";

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = { value: "New York, NY" };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.inferLocation(userId, description);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toBe("New York, NY");
    });

    it("should return null when description is empty", async () => {
      const userId = "user-456";

      const result = await service.inferLocation(userId, "  ");

      expect(result).toBeNull();
    });

    it("should call callAi with rendered prompt", async () => {
      const userId = "user-789";
      const description = "Job in San Francisco";

      const promptRendererSpy = vi.spyOn(promptRenderer, "render");
      const callAiSpy = vi.spyOn(service, "callAi");
      callAiSpy.mockResolvedValue({ value: "San Francisco, CA" });

      await service.inferLocation(userId, description);

      expect(promptRendererSpy).toHaveBeenCalled();
    });
  });

  describe("inferWorkRegion", () => {
    it("should pass userId to callAi", async () => {
      const userId = "user-123";
      const description = "Remote position across US.";

      const callAiSpy = vi.spyOn(service, "callAi");
      const mockResult = { value: "United States" };

      callAiSpy.mockResolvedValue(mockResult);

      const result = await service.inferWorkRegion(userId, description);

      expect(callAiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          systemMessage: expect.any(String),
          userMessage: expect.any(String),
          responseFormat: "zod-response",
        }),
      );
      expect(result).toBe("United States");
    });

    it("should return null when description is empty", async () => {
      const userId = "user-456";

      const result = await service.inferWorkRegion(userId, "  ");

      expect(result).toBeNull();
    });
  });
});
