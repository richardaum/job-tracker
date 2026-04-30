import { Injectable } from "@nestjs/common";
import { OPENAI_MODEL } from "@api/env/server";
import { OpenAIService } from "@api/domains/application-ai/openai.service";

@Injectable()
export class AiService {
  constructor(private readonly openAIService: OpenAIService) {}

  async rewriteTextAsSingleParagraph(text: string): Promise<string> {
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
            "Return plain text only.",
            "If there is links, make sure to include them in the rewritten text.",
          ].join("\n"),
        },
        { role: "user", content: "Original text to rewrite: " + text },
      ],
    });

    const rewritten = response.output_text?.trim() ?? "";
    return rewritten.length > 0 ? rewritten : text.trim();
  }

  async restructureJobDescription(text: string): Promise<string> {
    const client = this.openAIService.getClient();

    const response = await client.responses.create({
      model: OPENAI_MODEL,
      temperature: 0.1,
      input: [
        {
          role: "system",
          content: [
            "Restructure the provided job posting text in English for readability only: add plain-text section headings on their own lines, then use hyphen bullets.",
            "Strict lossless fidelity: keep every substantive detail from the source. Prefer copying phrases sentence-by-sentence; do not summarize, shorten, generalized, euphemized, soften, tighten, omit, reinterpret, hedge, reorder meaning, invent roles, perks, thresholds, timelines, percentages, tooling, certifications, disclaimers, or legal/compliance nuances.",
            "Preserve all links, URLs, emails, casing, hyphenation/spelling variants, parentheses, slashes, enumerated markers, numbering, typography artifacts, and superscript/subscript cues (examples: numbered footnote markers such as trailing 1 / 2 / 3 symbols or similar). Never drop these cues; if ambiguous, reproduce them verbatim with their surrounding snippet.",
            "Bullet rules: unless the source explicitly groups items, typically one bullet = one sentence (or keep the original punctuation inside the bullet exactly as in source). Never merge bullets in a way that removes distinct clauses; when in doubt split into separate bullets quoting the originals.",
            "If a heading would have no bullets, keep those sentences as paragraphs under the heading verbatim.",
            "Do not translate beyond English if the whole input looks English.",
            "If information is uncertain or contradictory, keep it unchanged from the original.",
            "Return plain text only (no markdown code fences); headings are plain uppercase or title-case single lines ending with ':' is allowed only if faithful to originals or section labels you add.",
          ].join("\n"),
        },
        {
          role: "user",
          content:
            "Restructure this job description without losing any data:\n\n" +
            text,
        },
      ],
    });

    const rewritten = response.output_text?.trim() ?? "";
    return rewritten.length > 0 ? rewritten : text.trim();
  }
}
