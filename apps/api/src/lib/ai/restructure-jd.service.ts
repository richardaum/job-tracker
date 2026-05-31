import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { AiBaseService } from "./ai-base.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";

const restructureSchema = z.object({ restructured: z.string() });

@Injectable()
export class RestructureJDService extends AiBaseService {
  constructor(
    openAIClient: OpenAIClient,
    promptRenderer: PromptRendererService,
  ) {
    super(openAIClient, promptRenderer);
  }

  async restructureJobDescription(text: string): Promise<string> {
    const result = await this.callAi({
      systemMessage: [
        "Restructure the provided job posting text in English for readability only: add plain-text section headings on their own lines, then use hyphen bullets.",
        "Strict lossless fidelity: keep every substantive detail from the source. Prefer copying phrases sentence-by-sentence; do not summarize, shorten, generalized, euphemized, soften, tighten, omit, reinterpret, hedge, reorder meaning, invent roles, perks, thresholds, timelines, percentages, tooling, certifications, disclaimers, or legal/compliance nuances.",
        "Preserve all links, URLs, emails, casing, hyphenation/spelling variants, parentheses, slashes, enumerated markers, numbering, typography artifacts, and superscript/subscript cues (examples: numbered footnote markers such as trailing 1 / 2 / 3 symbols or similar). Never drop these cues; if ambiguous, reproduce them verbatim with their surrounding snippet.",
        "Bullet rules: unless the source explicitly groups items, typically one bullet = one sentence (or keep the original punctuation inside the bullet exactly as in source). Never merge bullets in a way that removes distinct clauses; when in doubt split into separate bullets quoting the originals.",
        "If a heading would have no bullets, keep those sentences as paragraphs under the heading verbatim.",
        "Do not translate beyond English if the whole input looks English.",
        "If information is uncertain or contradictory, keep it unchanged from the original.",
        "Return plain text only (no markdown code fences); headings are plain uppercase or title-case single lines ending with ':' is allowed only if faithful to originals or section labels you add.",
      ].join("\n"),
      userMessage:
        "Restructure this job description without losing any data:\n\n" + text,
      schema: restructureSchema,
      responseFormat: "zod-response",
    });

    return (result as z.infer<typeof restructureSchema>).restructured;
  }
}
