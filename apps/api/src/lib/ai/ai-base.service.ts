import { apiEnv } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
import { BadRequestException, Injectable } from "@nestjs/common";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ZodType } from "zod";

import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";

export type CallAiOptions =
  | {
      systemMessage: string;
      userMessage: string;
      model?: string;
      responseFormat: "zod-response";
      schema: ZodType;
    }
  | {
      systemMessage: string;
      userMessage: string;
      model?: string;
      responseFormat: "json-schema" | "json-schema-with-web-search";
      schemaJson: Record<string, unknown>;
    };

@Injectable()
export class AiBaseService {
  constructor(
    protected readonly openAIClient: OpenAIClient,
    protected readonly promptRenderer: PromptRendererService,
  ) {}

  async callAi(opts: CallAiOptions): Promise<unknown> {
    const client = this.openAIClient.getClient();
    const model = opts.model ?? apiEnv.OPENAI_MODEL;

    switch (opts.responseFormat) {
      case "zod-response": {
        const [error, response] = await tryRun(
          client.chat.completions.parse({
            model,
            messages: [
              { role: "system", content: opts.systemMessage },
              { role: "user", content: opts.userMessage },
            ],
            response_format: zodResponseFormat(opts.schema, "response"),
            temperature: 0.1,
          }),
        );

        if (error) {
          throw new BadRequestException(
            `AI call failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (!response) {
          throw new BadRequestException("AI returned no response.");
        }

        const message = response.choices[0]?.message;
        if (!message) {
          throw new BadRequestException("AI returned no message.");
        }
        if (message.refusal) {
          throw new BadRequestException(message.refusal);
        }
        if (!message.parsed) {
          throw new BadRequestException("AI returned a response that could not be parsed.");
        }

        return message.parsed;
      }

      case "json-schema":
      case "json-schema-with-web-search": {
        const [error, response] = await tryRun(
          client.responses.create({
            model,
            input: [
              { role: "system", content: opts.systemMessage },
              { role: "user", content: opts.userMessage },
            ],
            text: {
              format: {
                type: "json_schema",
                name: "response",
                strict: true,
                schema: opts.schemaJson,
              },
            },
            tools:
              opts.responseFormat === "json-schema-with-web-search"
                ? [{ type: "web_search_preview" }]
                : undefined,
            temperature: 0.1,
          }),
        );

        if (error) {
          throw new BadRequestException(
            `AI call failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (!response) {
          throw new BadRequestException("AI returned no response.");
        }

        const [parseError, parsed] = await tryRun(
          Promise.resolve().then(() => JSON.parse(response.output_text)),
        );
        if (parseError) {
          throw new BadRequestException("AI returned a response that could not be parsed as JSON.");
        }
        return parsed as unknown;
      }

      default:
        throw new BadRequestException(
          `Unknown response format: ${(opts as { responseFormat: string }).responseFormat}`,
        );
    }
  }
}
