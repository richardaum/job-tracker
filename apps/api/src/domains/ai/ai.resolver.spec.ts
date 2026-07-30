import { RestructureJDService, RewriteTextService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiResolver } from "./ai.resolver";

describe("AiResolver", () => {
  let resolver: AiResolver;
  let rewriteTextService: RewriteTextService;
  let restructureJDService: RestructureJDService;

  beforeEach(() => {
    rewriteTextService = {
      rewriteTextAsSingleParagraph: vi.fn().mockResolvedValue("Rewritten text"),
    } as unknown as RewriteTextService;

    restructureJDService = {
      restructureJobDescription: vi.fn().mockResolvedValue("Restructured JD"),
    } as unknown as RestructureJDService;

    resolver = new AiResolver(rewriteTextService, restructureJDService);
  });

  describe("rewriteTextWithAI", () => {
    it("should pass userId to rewriteTextService", async () => {
      const user = { userId: "user-123" };
      const text = "Text to rewrite";

      await resolver.rewriteTextWithAI(text, user);

      expect(rewriteTextService.rewriteTextAsSingleParagraph).toHaveBeenCalledWith(user.userId, text);
    });

    it("should return rewritten text", async () => {
      const user = { userId: "user-456" };
      const text = "Original text";
      const expected = "Rewritten text";

      const result = await resolver.rewriteTextWithAI(text, user);

      expect(result).toBe(expected);
    });
  });

  describe("restructureJobDescriptionWithAI", () => {
    it("should pass userId to restructureJDService", async () => {
      const user = { userId: "user-123" };
      const text = "Job description to restructure";

      await resolver.restructureJobDescriptionWithAI(text, user);

      expect(restructureJDService.restructureJobDescription).toHaveBeenCalledWith(user.userId, text);
    });

    it("should return restructured description", async () => {
      const user = { userId: "user-456" };
      const text = "Job description";
      const expected = "Restructured JD";

      const result = await resolver.restructureJobDescriptionWithAI(text, user);

      expect(result).toBe(expected);
    });
  });
});
