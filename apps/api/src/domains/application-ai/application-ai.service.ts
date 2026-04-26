import { BadRequestException, Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { GraphQLError } from "graphql";
import { OPENAI_API_KEY, OPENAI_MODEL } from "@api/env/server";
import { SalaryPeriodEnum } from "@api/domains/applications/salary-period.enum";
import { type AiExtractionTagInput } from "@api/domains/applications/create-application-with-ai.input";

type GenerateDraftInput = {
  prompt: string;
  tags: AiExtractionTagInput[];
};
type FieldOutput = {
  field: string;
  raw: string | null;
  normalized: string | null;
  value: unknown;
  error?: string;
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

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

function toSalaryPeriod(value: unknown): SalaryPeriodEnum | null {
  const text = toTrimmedString(value)?.toLowerCase();
  if (text === SalaryPeriodEnum.YEAR) return SalaryPeriodEnum.YEAR;
  if (text === SalaryPeriodEnum.MONTH) return SalaryPeriodEnum.MONTH;
  if (text === SalaryPeriodEnum.HOUR) return SalaryPeriodEnum.HOUR;
  return null;
}

function isTipTapDocument(value: string): boolean {
  try {
    const parsed = JSON.parse(value) as { type?: unknown; content?: unknown };
    return parsed.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

function asTipTapDocument(value: string | null): string | null {
  if (!value) return null;
  if (isTipTapDocument(value)) return value;
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: value }],
      },
    ],
  });
}

function stripCodeBlock(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(
    /^```(?:json|toon|text|plaintext)?\n([\s\S]*?)\n```$/i,
  );
  return match?.[1]?.trim() ?? trimmed;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function raiseAiDraftError(
  message: string,
  aiOutputRaw: string | null,
  aiOutputNormalized?: string | null,
): never {
  throw new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      aiOutputRaw,
      aiOutputNormalized: aiOutputNormalized ?? null,
    },
  });
}

const FIELD_SPECS = [
  { name: "title", schema: { type: "string" } },
  { name: "company", schema: { type: "string" } },
  { name: "url", schema: { type: ["string", "null"] } },
  { name: "description", schema: { type: ["string", "null"] } },
  { name: "salaryCurrency", schema: { type: ["string", "null"] } },
  { name: "salaryMinCents", schema: { type: ["integer", "null"] } },
  { name: "salaryMaxCents", schema: { type: ["integer", "null"] } },
  {
    name: "salaryPeriod",
    schema: {
      type: ["string", "null"],
      enum: ["year", "month", "hour", null],
    },
  },
  { name: "tags", schema: { type: "array", items: { type: "string" } } },
  { name: "noteBlocks", schema: { type: "array", items: { type: "string" } } },
] as const;

@Injectable()
export class ApplicationAiService {
  private readonly client: OpenAI | null = OPENAI_API_KEY
    ? new OpenAI({ apiKey: OPENAI_API_KEY })
    : null;

  private async extractField(
    fieldName: string,
    schema: Record<string, unknown>,
    prompt: string,
    tagsJson: string,
  ): Promise<FieldOutput> {
    if (!this.client) {
      throw new BadRequestException("OPENAI_API_KEY is not configured.");
    }

    try {
      const response = await this.client.responses.create({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: [
                  "You extract exactly one field from a job description.",
                  `Field to extract: ${fieldName}`,
                  "Return ONLY strict JSON matching the schema.",
                ].join("\n"),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  "Job description:",
                  prompt,
                  "",
                  "Optional extraction tags:",
                  tagsJson,
                ].join("\n"),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: `field_${fieldName}`,
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                value: schema,
              },
              required: ["value"],
            },
          },
        },
        temperature: 0.1,
      });

      const raw =
        response.output_text ??
        (response.output
          ? safeStringify(response.output)
          : safeStringify(response));
      const normalized = stripCodeBlock(raw ?? "");
      const parsed = normalized
        ? (JSON.parse(normalized) as { value?: unknown })
        : {};

      return {
        field: fieldName,
        raw,
        normalized,
        value: parsed.value ?? null,
      };
    } catch (error) {
      return {
        field: fieldName,
        raw: null,
        normalized: null,
        value: null,
        error:
          error instanceof Error ? error.message : "Unknown extraction error",
      };
    }
  }

  async generateDraft(
    input: GenerateDraftInput,
  ): Promise<AIGeneratedApplicationDraft> {
    const prompt = input.prompt.trim();
    if (!prompt) {
      throw new BadRequestException("Prompt cannot be empty.");
    }
    if (!this.client) {
      throw new BadRequestException("OPENAI_API_KEY is not configured.");
    }

    const tagsJson = safeStringify({
      extractionTags: input.tags.map((tag) => ({
        label: tag.label,
        metadata: tag.metadata ?? "",
      })),
    });

    const fieldOutputs = await Promise.all(
      FIELD_SPECS.map((field) =>
        this.extractField(field.name, field.schema, prompt, tagsJson),
      ),
    );
    const erroredFields = fieldOutputs.filter((item) => Boolean(item.error));
    if (erroredFields.length > 0) {
      raiseAiDraftError(
        `AI extraction failed for fields: ${erroredFields.map((item) => item.field).join(", ")}.`,
        safeStringify(fieldOutputs),
        null,
      );
    }

    const valueByField = Object.fromEntries(
      fieldOutputs.map((output) => [output.field, output.value]),
    ) as Record<string, unknown>;

    const title = toTrimmedString(valueByField.title);
    const company = toTrimmedString(valueByField.company);
    if (!title || !company) {
      raiseAiDraftError(
        "AI draft must include title and company.",
        safeStringify(fieldOutputs),
        null,
      );
    }

    const tags = (Array.isArray(valueByField.tags) ? valueByField.tags : [])
      .map((row) => toTrimmedString(row))
      .filter((value): value is string => Boolean(value));

    const noteBlocks = (
      Array.isArray(valueByField.noteBlocks) ? valueByField.noteBlocks : []
    )
      .map((row) => toTrimmedString(row))
      .filter((value): value is string => Boolean(value));

    const noteContents = noteBlocks
      .map((block) => asTipTapDocument(block))
      .filter((note): note is string => Boolean(note));

    return {
      title,
      company,
      url: toTrimmedString(valueByField.url),
      description: asTipTapDocument(toTrimmedString(valueByField.description)),
      salaryCurrency:
        toTrimmedString(valueByField.salaryCurrency)?.toUpperCase() ?? null,
      salaryMinCents: toNullableInteger(valueByField.salaryMinCents),
      salaryMaxCents: toNullableInteger(valueByField.salaryMaxCents),
      salaryPeriod: toSalaryPeriod(valueByField.salaryPeriod),
      tags,
      noteContents,
    };
  }
}
