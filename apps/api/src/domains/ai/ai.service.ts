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
}
