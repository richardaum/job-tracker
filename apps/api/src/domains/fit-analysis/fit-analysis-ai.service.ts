import type { PreferenceItem } from "@api/database/entities/user-preferences.entity";
import { OpenAIService } from "@api/domains/application-ai/openai.service";
import { TemplateService } from "@api/domains/shared/template/template.service";
import { OPENAI_MODEL } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
import { BadRequestException, Injectable } from "@nestjs/common";
import { zodResponseFormat } from "openai/helpers/zod";

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
export class FitAnalysisAiService {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly templateService: TemplateService,
  ) {}

  async extractResumeFitItems(
    jdText: string,
    resumeText: string,
  ): Promise<ResumeFitItemParsed[]> {
    const client = this.openAIService.getClient();

    const [responseError, response] = await tryRun(
      client.chat.completions.parse({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: this.templateService.render(
              RESUME_FIT_SYSTEM_TEMPLATE,
              {},
            ),
          },
          {
            role: "user",
            content: this.templateService.render(RESUME_FIT_USER_TEMPLATE, {
              jdText,
              resumeText,
            }),
          },
        ],
        response_format: zodResponseFormat(
          resumeFitAnalysisSchema,
          "resume_fit_analysis",
        ),
        temperature: 0.1,
      }),
    );

    if (responseError) {
      throw new BadRequestException(
        `AI resume fit analysis failed: ${responseError.message}`,
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
        "AI response could not be parsed as resume fit analysis.",
      );
    }

    return message.parsed.items;
  }

  async extractPreferenceFitItems(
    jdText: string,
    preferences: PreferenceItem[],
  ): Promise<PreferenceFitItemParsed[]> {
    if (preferences.length === 0) return [];

    const client = this.openAIService.getClient();

    const preferencesText = preferences
      .map((p, i) => `${i + 1}. ${p.text}`)
      .join("\n");

    const [responseError, response] = await tryRun(
      client.chat.completions.parse({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: this.templateService.render(
              PREFERENCE_FIT_SYSTEM_TEMPLATE,
              {},
            ),
          },
          {
            role: "user",
            content: this.templateService.render(PREFERENCE_FIT_USER_TEMPLATE, {
              jdText,
              preferencesText,
            }),
          },
        ],
        response_format: zodResponseFormat(
          preferenceFitAnalysisSchema,
          "preference_fit_analysis",
        ),
        temperature: 0.1,
      }),
    );

    if (responseError) {
      throw new BadRequestException(
        `AI preference fit analysis failed: ${responseError.message}`,
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
        "AI response could not be parsed as preference fit analysis.",
      );
    }

    return message.parsed.items;
  }
}
