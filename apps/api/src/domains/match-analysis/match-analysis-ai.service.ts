import type { PreferenceItem } from "@api/database/entities/work-preferences.entity";
import { AiAccessService, AiBaseService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { Injectable } from "@nestjs/common";

import type { PreferenceMatchItemParsed, ResumeMatchItemParsed } from "./match-analysis-ai.schema";
import { preferenceMatchAnalysisSchema, resumeMatchAnalysisSchema } from "./match-analysis-ai.schema";
import {
  PREFERENCE_MATCH_SYSTEM_TEMPLATE,
  PREFERENCE_MATCH_USER_TEMPLATE,
  RESUME_MATCH_SYSTEM_TEMPLATE,
  RESUME_MATCH_USER_TEMPLATE,
} from "./match-analysis-ai.templates";

@Injectable()
export class MatchAnalysisAiService extends AiBaseService {
  constructor(openAIClient: OpenAIClient, promptRenderer: PromptRendererService, aiAccess: AiAccessService) {
    super(openAIClient, promptRenderer, aiAccess);
  }

  async extractResumeMatchItems(userId: string, jdText: string, resumeText: string): Promise<ResumeMatchItemParsed[]> {
    const result = await this.callAi({
      userId,
      systemMessage: this.promptRenderer.render(RESUME_MATCH_SYSTEM_TEMPLATE, {}),
      userMessage: this.promptRenderer.render(RESUME_MATCH_USER_TEMPLATE, { jdText, resumeText }),
      schema: resumeMatchAnalysisSchema,
      responseFormat: "zod-response",
    });

    return (result as { items: ResumeMatchItemParsed[] }).items;
  }

  async extractPreferenceMatchItems(
    userId: string,
    jdText: string,
    preferences: PreferenceItem[],
  ): Promise<PreferenceMatchItemParsed[]> {
    if (preferences.length === 0) return [];

    const preferencesText = preferences.map((p, i) => `${i + 1}. ${p.text}`).join("\n");

    const result = await this.callAi({
      userId,
      systemMessage: this.promptRenderer.render(PREFERENCE_MATCH_SYSTEM_TEMPLATE, {}),
      userMessage: this.promptRenderer.render(PREFERENCE_MATCH_USER_TEMPLATE, { jdText, preferencesText }),
      schema: preferenceMatchAnalysisSchema,
      responseFormat: "zod-response",
    });

    return (result as { items: PreferenceMatchItemParsed[] }).items;
  }
}
