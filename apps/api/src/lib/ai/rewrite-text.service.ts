import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { AiBaseService } from "./ai-base.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";

const rewriteSchema = z.object({ rewritten: z.string() });

@Injectable()
export class RewriteTextService extends AiBaseService {
  constructor(openAIClient: OpenAIClient, promptRenderer: PromptRendererService) {
    super(openAIClient, promptRenderer);
  }

  async rewriteTextAsSingleParagraph(text: string): Promise<string> {
    const result = await this.callAi({
      systemMessage: [
        "Rewrite the provided text in English as a single paragraph.",
        "Preserve 100% of the original meaning.",
        "Do not add new facts, assumptions, or details.",
        "Return plain text only.",
        "If there is links, make sure to include them in the rewritten text.",
      ].join("\n"),
      userMessage: "Original text to rewrite: " + text,
      schema: rewriteSchema,
      responseFormat: "zod-response",
    });

    return (result as z.infer<typeof rewriteSchema>).rewritten;
  }
}
