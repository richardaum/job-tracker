import { OpenAIService } from "@api/domains/application-ai/openai.service";
import { describe, expect, it, vi } from "vitest";

import { CompanyAiService } from "./company-ai.service";

describe("CompanyAiService", () => {
  it("includes job posting snippets before the company name user turn", async () => {
    const create = vi
      .fn()
      .mockResolvedValue({
        output_text: JSON.stringify({
          description: '{"type":"doc","content":[{"type":"paragraph"}]}',
        }),
      });
    const openAIService = {
      getClient: vi.fn().mockReturnValue({ responses: { create } }),
    } as unknown as OpenAIService;
    const service = new CompanyAiService(openAIService);

    await service.generateCompanyDescription({
      companyName: "Acme",
      jobPostingContexts: [
        { title: "Engineer", plainTextDescription: "Real-time metrics" },
      ],
    });

    const inputTurns =
      (create.mock.calls[0]?.[0] as { input: Array<{ role: string }> }).input ??
      [];

    const userTurns = inputTurns.filter((t) => t.role === "user");
    expect(userTurns).toHaveLength(2);

    expect(JSON.stringify(create.mock.calls[0]?.[0]?.input ?? "")).toContain(
      "Real-time metrics",
    );
    expect(JSON.stringify(create.mock.calls[0]?.[0]?.input ?? "")).toContain(
      "Company name: Acme",
    );
  });

  it("omits postings block when no contexts passed", async () => {
    const create = vi
      .fn()
      .mockResolvedValue({
        output_text: JSON.stringify({
          description: '{"type":"doc","content":[{"type":"paragraph"}]}',
        }),
      });
    const openAIService = {
      getClient: vi.fn().mockReturnValue({ responses: { create } }),
    } as unknown as OpenAIService;
    const service = new CompanyAiService(openAIService);

    await service.generateCompanyDescription({ companyName: "Globex" });

    const turns = (
      create.mock.calls[0]?.[0] as { input: Array<{ role: string }> }
    ).input;
    expect(turns?.filter((t) => t.role === "user")).toHaveLength(1);
    expect(
      JSON.stringify(create.mock.calls[0]?.[0]?.input ?? ""),
    ).not.toContain("Posting 1");
  });
});
