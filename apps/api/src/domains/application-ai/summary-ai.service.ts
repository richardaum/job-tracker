import { TemplateService } from "@api/domains/shared/template/template.service";
import { OPENAI_MODEL } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
import { BadRequestException, Injectable } from "@nestjs/common";

import { OpenAIService } from "./openai.service";
import {
  SUMMARY_AI_SYSTEM_TEMPLATE,
  SUMMARY_AI_USER_TEMPLATE,
} from "./summary-ai.templates";

@Injectable()
export class SummaryAiService {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly templateService: TemplateService,
  ) {}

  async generateSummary(context: string): Promise<string> {
    const client = this.openAIService.getClient();

    const [responseError, response] = await tryRun(
      client.chat.completions.parse({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: this.templateService.render(
              SUMMARY_AI_SYSTEM_TEMPLATE,
              {},
            ),
          },
          {
            role: "user",
            content: this.templateService.render(SUMMARY_AI_USER_TEMPLATE, {
              context,
            }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "summary",
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description:
                    "Concise 2-4 sentence paragraph summarizing the job application",
                },
              },
              required: ["summary"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.1,
      }),
    );

    if (responseError) {
      throw new BadRequestException(
        `Failed to generate summary with AI: ${responseError.message}`,
      );
    }

    const message = response.choices[0]?.message;
    if (!message) {
      throw new BadRequestException("AI returned no message.");
    }
    if (message.refusal) {
      throw new BadRequestException(message.refusal);
    }
    if (!message.parsed) {
      throw new BadRequestException(
        "AI returned a response that could not be parsed.",
      );
    }

    const parsed = message.parsed as { summary: string };
    return parsed.summary;
  }
}
