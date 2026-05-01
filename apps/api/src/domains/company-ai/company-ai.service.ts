import { OpenAIService } from "@api/domains/application-ai/openai.service";
import {
  isTipTapDocumentString,
  plainTextToTipTap,
} from "@api/domains/shared/tiptap.util";
import { OPENAI_MODEL } from "@api/env/server";
import { BadRequestException, Injectable } from "@nestjs/common";

type GenerateCompanyDescriptionInput = { companyName: string };

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
                "2) Required sources: find and use both (a) the official company website URL and (b) the company's LinkedIn page URL.",
                "3) Source priority: treat the official website and LinkedIn as primary sources.",
                "4) Use other websites only as secondary support when needed, and do not let them override official website/LinkedIn facts unless those two are clearly outdated or missing.",
                "5) If there is a conflict between sources, prefer official website and LinkedIn.",
                "6) If data is uncertain, use neutral qualifiers such as likely, appears to, or publicly known as.",
                "7) Output format: return ONLY valid JSON in this exact shape: { description: string }.",
                '8) description must be a valid TipTap document JSON string (example: {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}).',
                "9) Prefer a single paragraph. No markdown or bullet lists.",
                "10) You may emphasize important keywords/terms using TipTap-compatible inline marks (for example bold and italic in text nodes).",
                "11) Use emphasis sparingly and only for truly important terms (company category, key products, market position, funding/stability signals).",
                "12) Do not use unsupported/custom marks; use only standard TipTap/StarterKit-compatible formatting.",
                "13) In that paragraph, cover: what the company does, products/services, approximate size, funding/stability signals, employee profile/culture cues, market relevance, and category/industry.",
                "14) The paragraph MUST explicitly include both URLs (official website and LinkedIn company page).",
                '15) Format both URLs as proper TipTap links using text node marks, e.g. {"type":"text","text":"https://example.com","marks":[{"type":"link","attrs":{"href":"https://example.com"}}]}.',
                "16) Use fully qualified absolute URLs (https://...) and avoid plain unlinked URL text whenever link marks are supported.",
              ].join("\n"),
            },
          ],
        },
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
