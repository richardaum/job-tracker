import { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { AiAccessService } from "./ai-access.service";
import { AiBaseService } from "./ai-base.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";

const rewriteSchema = z.object({ rewritten: z.string() });

@Injectable()
export class RewriteTextService extends AiBaseService {
  constructor(
    openAIClient: OpenAIClient,
    promptRenderer: PromptRendererService,
    aiAccess: AiAccessService,
    aiUsage: AiUsageService,
  ) {
    super(openAIClient, promptRenderer, aiAccess, aiUsage);
  }

  async rewriteTextAsSingleParagraph(userId: string, text: string): Promise<string> {
    const result = await this.callAi({
      userId,
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
