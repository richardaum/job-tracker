import type { PreferenceItem } from "@api/database/entities/user-preferences.entity";
import {
  AiBaseService,
  OpenAIClient,
  PromptRendererService,
} from "@api/lib/ai";
import { Injectable } from "@nestjs/common";

import type {
  PreferenceFitItemParsed,
  ResumeFitItemParsed,
} from "./fit-analysis-ai.schema";
import {
  preferenceFitAnalysisSchema,
  resumeFitAnalysisSchema,
} from "./fit-analysis-ai.schema";
import {
  PREFERENCE_FIT_SYSTEM_TEMPLATE,
  PREFERENCE_FIT_USER_TEMPLATE,
  RESUME_FIT_SYSTEM_TEMPLATE,
  RESUME_FIT_USER_TEMPLATE,
} from "./fit-analysis-ai.templates";

@Injectable()
export class FitAnalysisAiService extends AiBaseService {
  constructor(
    openAIClient: OpenAIClient,
    promptRenderer: PromptRendererService,
  ) {
    super(openAIClient, promptRenderer);
  }

  async extractResumeFitItems(
    jdText: string,
    resumeText: string,
  ): Promise<ResumeFitItemParsed[]> {
    const result = await this.callAi({
      systemMessage: this.promptRenderer.render(RESUME_FIT_SYSTEM_TEMPLATE, {}),
      userMessage: this.promptRenderer.render(RESUME_FIT_USER_TEMPLATE, {
        jdText,
        resumeText,
      }),
      schema: resumeFitAnalysisSchema,
      responseFormat: "zod-response",
    });

    return (result as { items: ResumeFitItemParsed[] }).items;
  }

  async extractPreferenceFitItems(
    jdText: string,
    preferences: PreferenceItem[],
  ): Promise<PreferenceFitItemParsed[]> {
    if (preferences.length === 0) return [];

    const preferencesText = preferences
      .map((p, i) => `${i + 1}. ${p.text}`)
      .join("\n");

    const result = await this.callAi({
      systemMessage: this.promptRenderer.render(
        PREFERENCE_FIT_SYSTEM_TEMPLATE,
        {},
      ),
      userMessage: this.promptRenderer.render(PREFERENCE_FIT_USER_TEMPLATE, {
        jdText,
        preferencesText,
      }),
      schema: preferenceFitAnalysisSchema,
      responseFormat: "zod-response",
    });

    return (result as { items: PreferenceFitItemParsed[] }).items;
  }
}
