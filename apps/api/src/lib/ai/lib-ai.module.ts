import { TemplateModule } from "@api/domains/shared/template/template.module";
import { Module } from "@nestjs/common";

import { AiBaseService } from "./ai-base.service";
import { LocationInferenceService } from "./location-inference.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";
import { RestructureJDService } from "./restructure-jd.service";
import { RewriteTextService } from "./rewrite-text.service";

@Module({
  imports: [TemplateModule],
  providers: [
    OpenAIClient,
    PromptRendererService,
    AiBaseService,
    RewriteTextService,
    RestructureJDService,
    LocationInferenceService,
  ],
  exports: [
    OpenAIClient,
    PromptRendererService,
    AiBaseService,
    RewriteTextService,
    RestructureJDService,
    LocationInferenceService,
  ],
})
export class LibAiModule {}
