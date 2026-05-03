import { OpenAIService } from "@api/domains/application-ai/openai.service";
import { NOTE_AI_STRUCTURED_RESPONSE_SCHEMA } from "@api/domains/shared/tiptap.schema";
import {
  isTipTapDocumentString,
  parseTipTapDocument,
  StructuredNoteOutput,
  structuredNoteToTipTapDocument,
  TipTapDocument,
} from "@api/domains/shared/tiptap.util";
import { OPENAI_MODEL } from "@api/env/server";
import { Injectable } from "@nestjs/common";

type GenerateNoteInput = { description: string; note: string };

type RewriteTextInput = { description: string; text: string };

@Injectable()
export class NoteAiService {
  constructor(private readonly openAIService: OpenAIService) {}

  async generateNote(input: GenerateNoteInput): Promise<TipTapDocument> {
    const client = this.openAIService.getClient();

    const response = await client.responses.create({
      model: OPENAI_MODEL,
      temperature: 0.1,
      input: [
        {
          role: "system",
          content: [
            "Rewrite the original note in English into a clearer, better-structured version while preserving 100% of the original meaning.",
            "Do not add new facts, assumptions, or details that are not present in the original note.",
            "Use the job description only as light context to improve wording/alignment, not as a source of new content.",
            "Return structured JSON only with sections and bullets.",
            "Each section must have a concise heading and short bullet lines in plain text.",
            "Do not use markdown, TipTap JSON, or rich text marks.",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            "Job description (light context only): " + input.description,
            "Original note to rewrite: " + input.note,
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "note_ai",
          strict: true,
          schema: NOTE_AI_STRUCTURED_RESPONSE_SCHEMA,
        },
      },
    });

    const parsed = JSON.parse(
      response.output_text ?? "{}",
    ) as Partial<StructuredNoteOutput>;
    const sections = Array.isArray(parsed.sections) ? parsed.sections : [];
    if (sections.length === 0) throw new Error("Failed to generate note.");

    const tiptapDoc = structuredNoteToTipTapDocument({ sections }, input.note);
    const noteString = JSON.stringify(tiptapDoc);
    if (!isTipTapDocumentString(noteString)) {
      throw new Error("Invalid note format.");
    }

    return parseTipTapDocument(noteString);
  }

  async rewriteTextAsSingleParagraph(input: RewriteTextInput): Promise<string> {
    const client = this.openAIService.getClient();

    const response = await client.responses.create({
      model: OPENAI_MODEL,
      temperature: 0.1,
      input: [
        {
          role: "system",
          content: [
            "Rewrite the provided text in English as a single paragraph.",
            "Preserve 100% of the original meaning.",
            "Do not add new facts, assumptions, or details.",
            "Use the job context only to improve clarity and wording.",
            "Return plain text only.",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            "Job description (light context only): " + input.description,
            "Original text to rewrite: " + input.text,
          ].join("\n"),
        },
      ],
    });

    const rewritten = response.output_text?.trim() ?? "";
    return rewritten.length > 0 ? rewritten : input.text.trim();
  }
}
