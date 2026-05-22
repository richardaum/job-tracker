import { htmlToPlainText } from "@api/domains/shared/html-plain-text.util";
import {
  AiBaseService,
  OpenAIClient,
  PromptRendererService,
} from "@api/lib/ai";
import { BadRequestException, Injectable } from "@nestjs/common";

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
import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";

@Injectable()
export class DraftExtractionService extends AiBaseService {
  constructor(
    openAIClient: OpenAIClient,
    promptRenderer: PromptRendererService,
    private readonly normalizationService: DraftExtractionNormalizationService,
  ) {
    super(openAIClient, promptRenderer);
  }

  async extract(input: {
    title: string;
    url: string | null;
    htmlContent: string;
  }): Promise<DraftExtractionModel> {
    const postingPlainText = htmlToPlainText(input.htmlContent);
    if (!postingPlainText.trim() && !input.title.trim() && !input.url?.trim()) {
      throw new BadRequestException("Draft has no usable content to extract.");
    }

    const raw = await this.callAi({
      systemMessage: this.promptRenderer.render(
        DRAFT_EXTRACTION_SYSTEM_TEMPLATE,
        { fields: formatSystemPromptFields(DRAFT_EXTRACTION_FIELD_SPECS) },
      ),
      userMessage: this.promptRenderer.render(DRAFT_EXTRACTION_USER_TEMPLATE, {
        title: input.title,
        url: input.url,
        postingPlainText,
        fields: formatUserPromptFields(DRAFT_EXTRACTION_FIELD_SPECS),
      }),
      schema: draftExtractionModelSchema,
      responseFormat: "zod-response",
    });

    return raw as DraftExtractionModel;
  }
}

export { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";
