import { describe, expect, it, vi } from "vitest";
import { GraphQLError } from "graphql";
import { ApplicationAiService } from "./application-ai.service";

describe("ApplicationAiService", () => {
  function fieldOutput(value: unknown) {
    return { output_text: JSON.stringify({ value }) };
  }

  it("parses JSON output into a normalized draft", async () => {
    const service = new ApplicationAiService();
    const create = vi
      .fn()
      .mockResolvedValueOnce(fieldOutput("Senior Engineer"))
      .mockResolvedValueOnce(fieldOutput("Acme"))
      .mockResolvedValueOnce(fieldOutput("https://acme.com/jobs/1"))
      .mockResolvedValueOnce(fieldOutput("Great role"))
      .mockResolvedValueOnce(fieldOutput("USD"))
      .mockResolvedValueOnce(fieldOutput(12000000))
      .mockResolvedValueOnce(fieldOutput(15000000))
      .mockResolvedValueOnce(fieldOutput("year"))
      .mockResolvedValueOnce(fieldOutput(["React", "TypeScript"]))
      .mockResolvedValueOnce(fieldOutput(["Fully remote in LATAM."]));

    (service as unknown as { client: unknown }).client = {
      responses: { create },
    };

    const draft = await service.generateDraft({
      prompt: "Senior engineer role",
      tags: [{ label: "Title", metadata: "as field value" }],
    });

    expect(draft.title).toBe("Senior Engineer");
    expect(draft.company).toBe("Acme");
    expect(draft.salaryCurrency).toBe("USD");
    expect(draft.tags).toEqual(["React", "TypeScript"]);
    expect(draft.description).toContain('"type":"doc"');
    expect(draft.noteContents).toHaveLength(1);
    expect(draft.noteContents[0]).toContain('"type":"doc"');
    expect(create).toHaveBeenCalledTimes(10);
  });

  it("throws when title or company is missing", async () => {
    const service = new ApplicationAiService();
    const create = vi
      .fn()
      .mockResolvedValueOnce(fieldOutput(""))
      .mockResolvedValueOnce(fieldOutput("Acme"))
      .mockResolvedValueOnce(fieldOutput(null))
      .mockResolvedValueOnce(fieldOutput("No title"))
      .mockResolvedValueOnce(fieldOutput(null))
      .mockResolvedValueOnce(fieldOutput(null))
      .mockResolvedValueOnce(fieldOutput(null))
      .mockResolvedValueOnce(fieldOutput(null))
      .mockResolvedValueOnce(fieldOutput([]))
      .mockResolvedValueOnce(fieldOutput([]));
    (service as unknown as { client: unknown }).client = {
      responses: {
        create,
      },
    };

    await expect(
      service.generateDraft({
        prompt: "Role without title",
        tags: [],
      }),
    ).rejects.toThrow(GraphQLError);
  });
});
