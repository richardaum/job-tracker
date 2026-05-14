import { htmlToPlainText } from "@api/domains/shared/html-plain-text.util";
import { TemplateService } from "@api/domains/shared/template/template.service";
import { OPENAI_MODEL } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
import { BadRequestException, Injectable } from "@nestjs/common";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  DRAFT_EXTRACTION_FIELD_SPECS,
  formatSystemPromptFields,
  formatUserPromptFields,
} from "./draft-extraction.model";
import { draftExtractionModelSchema } from "./draft-extraction.schema";
import {
  DRAFT_EXTRACTION_SYSTEM_TEMPLATE,
  DRAFT_EXTRACTION_USER_TEMPLATE,
} from "./draft-extraction.templates";
import type { DraftExtractionModel } from "./draft-extraction.types";
import {
  locationInferenceSchema,
  workRegionInferenceSchema,
} from "./location-inference.schema";
import {
  LOCATION_INFERENCE_SYSTEM_TEMPLATE,
  LOCATION_INFERENCE_USER_TEMPLATE,
  WORK_REGION_INFERENCE_SYSTEM_TEMPLATE,
  WORK_REGION_INFERENCE_USER_TEMPLATE,
} from "./location-inference.templates";
import { OpenAIService } from "./openai.service";

@Injectable()
export class ApplicationAiService {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * Calls OpenAI with draft page context; returns the strict draft extraction object (unknown JSON keys rejected).
   */
  async extractFromDraft(input: {
    title: string;
    url: string | null;
    htmlContent: string;
  }): Promise<DraftExtractionModel> {
    const postingPlainText = htmlToPlainText(input.htmlContent);
    if (!postingPlainText.trim() && !input.title.trim() && !input.url?.trim()) {
      throw new BadRequestException("Draft has no usable content to extract.");
    }

    const client = this.openAIService.getClient();

    const [responseError, response] = await tryRun(
      client.chat.completions.parse({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: this.templateService.render(
              DRAFT_EXTRACTION_SYSTEM_TEMPLATE,
              {
                fields: formatSystemPromptFields(DRAFT_EXTRACTION_FIELD_SPECS),
              },
            ),
          },
          {
            role: "user",
            content: this.templateService.render(
              DRAFT_EXTRACTION_USER_TEMPLATE,
              {
                title: input.title,
                url: input.url,
                postingPlainText,
                fields: formatUserPromptFields(DRAFT_EXTRACTION_FIELD_SPECS),
              },
            ),
          },
        ],
        response_format: zodResponseFormat(
          draftExtractionModelSchema,
          "draft_extraction",
        ),
        temperature: 0.1,
      }),
    );
    if (responseError) {
      throw new BadRequestException(
        `Failed to extract draft content with AI: ${responseError.message}`,
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
        "AI returned a response that could not be parsed as draft extraction.",
      );
    }

    return message.parsed;
  }

  async inferLocationFromDescription(
    descriptionPlainText: string,
  ): Promise<string | null> {
    if (!descriptionPlainText.trim()) return null;

    const parsed = await this.callInference(
      descriptionPlainText,
      LOCATION_INFERENCE_SYSTEM_TEMPLATE,
      LOCATION_INFERENCE_USER_TEMPLATE,
      locationInferenceSchema,
      "location_inference",
    );
    return parsed.value;
  }

  async inferWorkRegionFromDescription(
    descriptionPlainText: string,
  ): Promise<string | null> {
    if (!descriptionPlainText.trim()) return null;

    const parsed = await this.callInference(
      descriptionPlainText,
      WORK_REGION_INFERENCE_SYSTEM_TEMPLATE,
      WORK_REGION_INFERENCE_USER_TEMPLATE,
      workRegionInferenceSchema,
      "work_region_inference",
    );
    return parsed.value;
  }

  private async callInference<T>(
    descriptionPlainText: string,
    systemTemplate: string,
    userTemplate: string,
    schema: z.ZodType<T>,
    responseKey: string,
  ): Promise<T> {
    const client = this.openAIService.getClient();

    const [responseError, response] = await tryRun(
      client.chat.completions.parse({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemTemplate },
          {
            role: "user",
            content: this.templateService.render(userTemplate, {
              description: descriptionPlainText,
            }),
          },
        ],
        response_format: zodResponseFormat(schema, responseKey),
        temperature: 0.1,
      }),
    );

    if (responseError) {
      throw new BadRequestException(
        `Failed to infer with AI: ${responseError.message}`,
      );
    }

    const message = response.choices[0]?.message;
    if (!message) throw new BadRequestException("AI returned no message.");
    if (message.refusal) throw new BadRequestException(message.refusal);
    if (!message.parsed)
      throw new BadRequestException(
        "AI returned a response that could not be parsed.",
      );

    return message.parsed;
  }
}
