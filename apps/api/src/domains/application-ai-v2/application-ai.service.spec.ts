import { OpenAIService } from "@api/domains/application-ai/openai.service";
import { TemplateService } from "@api/domains/shared/template/template.service";
import { describe, expect, it, vi } from "vitest";

import { ApplicationAiService } from "./application-ai.service";

function createService(openAIService: OpenAIService) {
  return new ApplicationAiService(openAIService, new TemplateService());
}

describe("ApplicationAiService", () => {
  it("extractFromDraft returns parsed JSON from the model", async () => {
    const parsed = {
      title: "Senior Engineer",
      company: "Acme",
      description: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Build things" }],
          },
        ],
      }),
      url: "https://acme.com/jobs/1",
      salary: { min: null, max: null, currency: null, period: null },
      tags: ["typescript"],
    };
    const parse = vi
      .fn()
      .mockResolvedValue({ choices: [{ message: { parsed, refusal: null } }] });
    const openAIService = {
      getClient: vi.fn().mockReturnValue({ chat: { completions: { parse } } }),
    } as unknown as OpenAIService;
    const service = createService(openAIService);

    const raw = await service.extractFromDraft({
      title: "Job",
      url: "https://example.com",
      htmlContent: "<p>Hello</p>",
    });

    expect(raw.title).toBe("Senior Engineer");
    expect(raw.company).toBe("Acme");
    expect(raw.tags).toEqual(["typescript"]);
    expect(raw.url).toBe("https://acme.com/jobs/1");
  });
});
