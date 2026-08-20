import { apiEnv } from "@api/env/server";
import type { AiTokenUsage } from "@api/domains/ai-usage/ai-usage.schema";
import type { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { tryRun } from "@job-tracker/try-run";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ZodType } from "zod";

import { AiAccessService } from "./ai-access.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";

export type CallAiOptions = (
  | { systemMessage: string; userMessage: string; model?: string; responseFormat: "zod-response"; schema: ZodType }
  | {
      systemMessage: string;
      userMessage: string;
      model?: string;
      responseFormat: "json-schema" | "json-schema-with-web-search";
      schemaJson: Record<string, unknown>;
    }
) & { userId: string };

@Injectable()
export class AiBaseService {
  private readonly usageLogger = new Logger(AiBaseService.name);

  constructor(
    protected readonly openAIClient: OpenAIClient,
    protected readonly promptRenderer: PromptRendererService,
    protected readonly aiAccess: AiAccessService,
    private readonly aiUsage: AiUsageService,
  ) {}

  async callAi(opts: CallAiOptions): Promise<unknown> {
    const access = await this.aiAccess.resolveClientAccess(opts.userId);
    const client = this.openAIClient.getClientFor(access.key);
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
          throw new BadRequestException(`AI call failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        if (!response) {
          throw new BadRequestException("AI returned no response.");
        }

        await this.recordUsage(
          opts.userId,
          access.source,
          response.usage
            ? {
                inputTokens: response.usage.prompt_tokens,
                outputTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
              }
            : undefined,
          "chat-completions",
        );

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
            text: { format: { type: "json_schema", name: "response", strict: true, schema: opts.schemaJson } },
            tools: opts.responseFormat === "json-schema-with-web-search" ? [{ type: "web_search_preview" }] : undefined,
            temperature: 0.1,
          }),
        );

        if (error) {
          throw new BadRequestException(`AI call failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        if (!response) {
          throw new BadRequestException("AI returned no response.");
        }

        await this.recordUsage(
          opts.userId,
          access.source,
          response.usage
            ? {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
                totalTokens: response.usage.total_tokens,
              }
            : undefined,
          "responses",
        );

        const [parseError, parsed] = await tryRun(Promise.resolve().then(() => JSON.parse(response.output_text)));
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

  protected async recordUsage(
    userId: string,
    source: AiUsageSourceEnum,
    usage: AiTokenUsage | undefined,
    requestPath: string,
  ): Promise<void> {
    if (!usage) {
      this.usageLogger.warn(`OpenAI response missing usage: source=${source}, requestPath=${requestPath}`);
      return;
    }

    const [error] = await tryRun(this.aiUsage.record(userId, source, usage));
    if (error) {
      this.usageLogger.error(`Failed to persist OpenAI usage: source=${source}, requestPath=${requestPath}`);
    }
  }
}
