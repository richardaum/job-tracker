import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { AiAccessService } from "./ai-access.service";
import { AiBaseService } from "./ai-base.service";
import { locationInferenceSchema, workRegionInferenceSchema } from "./location-inference.schema";
import {
  LOCATION_INFERENCE_SYSTEM_TEMPLATE,
  LOCATION_INFERENCE_USER_TEMPLATE,
  WORK_REGION_INFERENCE_SYSTEM_TEMPLATE,
  WORK_REGION_INFERENCE_USER_TEMPLATE,
} from "./location-inference.templates";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";

@Injectable()
export class LocationInferenceService extends AiBaseService {
  constructor(openAIClient: OpenAIClient, promptRenderer: PromptRendererService, aiAccess: AiAccessService) {
    super(openAIClient, promptRenderer, aiAccess);
  }

  async inferLocation(userId: string, descriptionPlainText: string): Promise<string | null> {
    if (!descriptionPlainText.trim()) return null;

    const result = await this.callAi({
      userId,
      systemMessage: LOCATION_INFERENCE_SYSTEM_TEMPLATE,
      userMessage: this.promptRenderer.render(LOCATION_INFERENCE_USER_TEMPLATE, { description: descriptionPlainText }),
      schema: locationInferenceSchema,
      responseFormat: "zod-response",
    });

    return (result as z.infer<typeof locationInferenceSchema>).value;
  }

  async inferWorkRegion(userId: string, descriptionPlainText: string): Promise<string | null> {
    if (!descriptionPlainText.trim()) return null;

    const result = await this.callAi({
      userId,
      systemMessage: WORK_REGION_INFERENCE_SYSTEM_TEMPLATE,
      userMessage: this.promptRenderer.render(WORK_REGION_INFERENCE_USER_TEMPLATE, {
        description: descriptionPlainText,
      }),
      schema: workRegionInferenceSchema,
      responseFormat: "zod-response",
    });

    return (result as z.infer<typeof workRegionInferenceSchema>).value;
  }
}
