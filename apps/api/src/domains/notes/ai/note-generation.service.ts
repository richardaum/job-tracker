import { NOTE_AI_STRUCTURED_RESPONSE_SCHEMA } from "@api/domains/shared/tiptap.schema";
import { AiAccessService, AiBaseService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import type { StructuredNoteOutput, TipTapDocument } from "@job-tracker/tiptap";
import { isTipTapDocumentString, parseTipTapDocument, structuredNoteToTipTapDocument } from "@job-tracker/tiptap";
import { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { Injectable } from "@nestjs/common";
import { z } from "zod";

type GenerateNoteInput = { description: string; note: string };
type RewriteTextInput = { description: string; text: string };

const rewriteSchema = z.object({ rewritten: z.string() });

@Injectable()
export class NoteGenerationService extends AiBaseService {
  constructor(
    openAIClient: OpenAIClient,
    promptRenderer: PromptRendererService,
    aiAccess: AiAccessService,
    aiUsage: AiUsageService,
  ) {
    super(openAIClient, promptRenderer, aiAccess, aiUsage);
  }

  async generateNote(userId: string, input: GenerateNoteInput): Promise<TipTapDocument> {
    const result = (await this.callAi({
      userId,
      systemMessage: [
        "Rewrite the original note in English into a clearer, better-structured version while preserving 100% of the original meaning.",
        "Do not add new facts, assumptions, or details that are not present in the original note.",
        "Use the job description only as light context to improve wording/alignment, not as a source of new content.",
        "Return structured JSON only with sections and bullets.",
        "Each section must have an ultra-short, synthesized heading (max 2-3 words) and short bullet lines in plain text.",
        "Do not use markdown, TipTap JSON, or rich text marks.",
      ].join("\n"),
      userMessage: [
        "Job description (light context only): " + input.description,
        "Original note to rewrite: " + input.note,
      ].join("\n"),
      schemaJson: NOTE_AI_STRUCTURED_RESPONSE_SCHEMA,
      responseFormat: "json-schema",
    })) as { sections: Array<{ heading: string; bullets: string[] }> };

    const sections = Array.isArray(result.sections) ? result.sections : [];
    if (sections.length === 0) throw new Error("Failed to generate note.");

    const tiptapDoc = structuredNoteToTipTapDocument({ sections } as StructuredNoteOutput, input.note);
    const noteString = JSON.stringify(tiptapDoc);
    if (!isTipTapDocumentString(noteString)) {
      throw new Error("Invalid note format.");
    }

    return parseTipTapDocument(noteString);
  }

  async rewriteTextAsSingleParagraph(userId: string, input: RewriteTextInput): Promise<string> {
    const result = await this.callAi({
      userId,
      systemMessage: [
        "Rewrite the provided text in English as a single paragraph.",
        "Preserve 100% of the original meaning.",
        "Do not add new facts, assumptions, or details.",
        "Use the job context only to improve clarity and wording.",
        "Return plain text only.",
      ].join("\n"),
      userMessage: [
        "Job description (light context only): " + input.description,
        "Original text to rewrite: " + input.text,
      ].join("\n"),
      schema: rewriteSchema,
      responseFormat: "zod-response",
    });

    return (result as z.infer<typeof rewriteSchema>).rewritten;
  }
}
