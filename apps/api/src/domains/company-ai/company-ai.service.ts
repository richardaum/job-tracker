import { OpenAIService } from "@api/domains/application-ai/openai.service";
import { OPENAI_MODEL } from "@api/env/server";
import { isTipTapDocumentString, plainTextToTipTap } from "@job-tracker/tiptap";
import { BadRequestException, Injectable } from "@nestjs/common";

type JobPostingContextSnippet = { title: string; plainTextDescription: string };

type GenerateCompanyDescriptionInput = {
  companyName: string;
  jobPostingContexts?: JobPostingContextSnippet[];
};

@Injectable()
export class CompanyAiService {
  constructor(private readonly openAIService: OpenAIService) {}

  async generateCompanyDescription(
    input: GenerateCompanyDescriptionInput,
  ): Promise<string> {
    const companyName = input.companyName.trim();
    if (!companyName) {
      throw new BadRequestException("Company name cannot be empty.");
    }

    const client = this.openAIService.getClient();
    const response = await client.responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You generate concise company descriptions for job tracking.",
                "Follow these rules in order:",
                "1) Research first: perform a web search before writing.",
                "2) Required sources: find and use both (a) the official company website URL and (b) the company's LinkedIn company page URL. These URLs MUST appear in the structured output paragraph as linked TipTap URLs.",
                "3) Forbidden inference: NEVER guess URLs, domains, rebrands, headcount ranges, HQ locations, funding amounts, founders, or other facts.",
                '4) If the official homepage or canonical LinkedIn company URL cannot be obtained from authoritative search results aligned with the company name, STOP: return ONLY valid JSON { "description": "" }.',
                "5) If any required fact exists only by inference (not stated verbatim in postings or corroborated from primary sources in search), omit that fact.",
                "6) Source priority: treat the verified official website and LinkedIn profile as primary; other sites are secondary corroboration only.",
                "7) Use other websites only as secondary support when needed, without overriding verified official website / LinkedIn context.",
                "8) LinkedIn/job-board listing URLs pasted in postings are NOT the official company homepage and must NOT substitute for requirement (2-a). Still treat job posting text strictly as verbatim user-derived context.",
                "9) When job posting excerpts are provided, you may summarize company-relevant wording that appears verbatim inside them, but factual claims tied to postings must stay strictly attributable to those excerpts (still no invented metrics).",
                "10) If data is uncertain, use neutral qualifiers such as likely, appears to, or publicly known as—but only where search-backed evidence exists.",
                "11) Output format: return ONLY valid JSON in this exact shape: { description: string }.",
                '12) description must be a valid TipTap document JSON string (example: {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}). Prefer one paragraph—no markdown or bullet lists.',
                "13) You may emphasize important keywords/terms using TipTap-compatible inline marks (for example bold and italic in text nodes).",
                "14) Use emphasis sparingly and only for truly important terms (company category, key products, market position, funding/stability signals).",
                "15) Do not use unsupported/custom marks; use only standard TipTap/StarterKit-compatible formatting.",
                "16) In that paragraph (when URLs are obtainable), cover company-relevant attributable facts drawn from postings and search sources together.",
                '17) Include both authoritative URLs formatted as TipTap links, e.g. {"type":"text","text":"https://example.com","marks":[{"type":"link","attrs":{"href":"https://example.com"}}]}. Use fully qualified https URLs.',
              ].join("\n"),
            },
          ],
        },
        ...(input.jobPostingContexts && input.jobPostingContexts.length > 0
          ? [
              {
                role: "user" as const,
                content: [
                  {
                    type: "input_text" as const,
                    text: [
                      "The following job posting excerpts belong to saved applications tied to this company name.",
                      "They are verbatim excerpts from TipTap-backed descriptions:",
                      "",
                      ...input.jobPostingContexts.map(
                        (j, idx) =>
                          `Posting ${idx + 1} — Title: ${j.title}\nText:\n${j.plainTextDescription}`,
                      ),
                      "",
                      "Treat them only as verbatim context; authoritative URLs remain subject to mandatory web sourcing rules.",
                    ].join("\n"),
                  },
                ],
              },
            ]
          : []),
        {
          role: "user",
          content: [
            { type: "input_text", text: `Company name: ${companyName}` },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "company_description",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { description: { type: "string" } },
            required: ["description"],
          },
        },
      },
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.output_text ?? "{}") as {
      description?: string;
    };
    const description = parsed.description?.trim() ?? "";

    if (!description) {
      return plainTextToTipTap("");
    }

    return isTipTapDocumentString(description)
      ? description
      : plainTextToTipTap(description);
  }
}
