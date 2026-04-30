import { describe, expect, it, vi } from "vitest";
import { SalaryPeriodEnum } from "@api/domains/applications/salary-period.enum";
import { ApplicationAiService } from "./application-ai.service";
import { OpenAIService } from "./openai.service";

describe("ApplicationAiService", () => {
  it("builds a strict prompt and parses draft output", async () => {
    const create = vi
      .fn()
      .mockResolvedValue({
        output_text: JSON.stringify({
          title: "Senior Engineer",
          company: "Acme",
          description: "Original job post text",
          url: "https://acme.com/jobs/1",
          salaryMinCents: 10000000,
          salaryMaxCents: 12000000,
          salaryCurrency: "USD",
          salaryPeriod: "year",
          tags: ["Remote"],
          noteContents: ["Great benefits"],
        }),
      });
    const openAIService = {
      getClient: vi.fn().mockReturnValue({ responses: { create } }),
    } as unknown as OpenAIService;
    const service = new ApplicationAiService(openAIService);

    const draft = await service.generateDraft({
      prompt: "Senior engineer role",
      fields: [{ label: "Title", metadata: "as field value" }],
    });

    expect(openAIService.getClient).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0]?.[0]?.input?.[0]?.content?.[0]?.text).toContain(
      "Return ONLY valid JSON and strictly follow this exact structure:",
    );
    expect(draft).toEqual({
      title: "Senior Engineer",
      company: "Acme",
      description: "Original job post text",
      url: "https://acme.com/jobs/1",
      salaryMinCents: 10000000,
      salaryMaxCents: 12000000,
      salaryCurrency: "USD",
      salaryPeriod: SalaryPeriodEnum.YEAR,
      tags: ["Remote"],
      noteContents: ["Great benefits"],
    });
  });
});
