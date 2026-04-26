import { BadRequestException, Injectable } from "@nestjs/common";
import { SalaryPeriodEnum } from "@api/domains/applications/salary-period.enum";
import { type AiExtractionFieldInput } from "@api/domains/applications/create-application-with-ai.input";
import { OPENAI_MODEL } from "@api/env/server";
import { OpenAIService } from "./openai.service";

type GenerateDraftInput = {
  prompt: string;
  fields: AiExtractionFieldInput[];
};

type GenerateDraftResponse = {
  title: string;
  company: string;
  description: string;
  url: string | null;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriodEnum | null;
  tags: string[];
  noteContents: string[];
};

export type AIGeneratedApplicationDraft = {
  title: string;
  company: string;
  description: string | null;
  url: string | null;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriodEnum | null;
  tags: string[];
  noteContents: string[];
};

function buildSystemPrompt(fields: AiExtractionFieldInput[]): string {
  const fieldsGuide = [
    ...fields.map((field, index) => {
      const label = field.label.trim();
      const metadata = field.metadata?.trim();
      return metadata
        ? `${index + 1}. ${label}: ${metadata}`
        : `${index + 1}. ${label}`;
    }),
  ].join("\n");

  return [
    "Extract job application information from the input text.",
    "Return ONLY valid JSON and strictly follow this exact structure:",
    "{",
    "  title:",
    "  company:",
    '  description: (valid TipTap JSON string: {"type":"doc","content":[...]} using original description text)',
    "  url:",
    "  salaryMinCents:",
    "  salaryMaxCents:",
    "  salaryCurrency:",
    "  salaryPeriod:",
    "  tags: (use only when explicitly requested.)",
    "  noteContents: (use only when explicitly requested.)",
    "}",
    "All fields are mandatory in the output object.",
    "Use the extraction field hints below when mapping values:",
    fieldsGuide,
    "salaryPeriod must be one of: year, month, hour, or null.",
  ].join("\n");
}

function buildUserPrompt(input: GenerateDraftInput): string {
  const extractionFields =
    input.fields.length === 0
      ? "- none"
      : input.fields
          .map((field) => {
            const metadata = field.metadata?.trim();
            return metadata
              ? `- ${field.label.trim()}: ${metadata}`
              : `- ${field.label.trim()}`;
          })
          .join("\n");

  return [
    "Text to extract from:",
    input.prompt,
    "",
    "Extraction fields:",
    extractionFields,
  ].join("\n");
}

@Injectable()
export class ApplicationAiService {
  constructor(private readonly openAIService: OpenAIService) {}

  async generateDraft(
    input: GenerateDraftInput,
  ): Promise<AIGeneratedApplicationDraft> {
    const prompt = input.prompt.trim();
    if (!prompt) throw new BadRequestException("Prompt cannot be empty.");
    const client = this.openAIService.getClient();

    const response = await client.responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [
            { type: "input_text", text: buildSystemPrompt(input.fields) },
          ],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: buildUserPrompt(input) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "application_ai_draft",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              company: { type: "string" },
              description: { type: "string" },
              url: { type: ["string", "null"] },
              salaryMinCents: { type: ["integer", "null"] },
              salaryMaxCents: { type: ["integer", "null"] },
              salaryCurrency: { type: ["string", "null"] },
              salaryPeriod: {
                type: ["string", "null"],
                enum: ["year", "month", "hour", null],
              },
              tags: {
                type: "array",
                items: { type: "string" },
              },
              noteContents: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "title",
              "company",
              "description",
              "url",
              "salaryMinCents",
              "salaryMaxCents",
              "salaryCurrency",
              "salaryPeriod",
              "tags",
              "noteContents",
            ],
          },
        },
      },
      temperature: 0.1,
    });

    const parsed = JSON.parse(
      response.output_text ?? "{}",
    ) as GenerateDraftResponse;

    return {
      ...parsed,
      salaryPeriod:
        parsed.salaryPeriod === "year"
          ? SalaryPeriodEnum.YEAR
          : parsed.salaryPeriod === "month"
            ? SalaryPeriodEnum.MONTH
            : parsed.salaryPeriod === "hour"
              ? SalaryPeriodEnum.HOUR
              : null,
    };
  }
}
