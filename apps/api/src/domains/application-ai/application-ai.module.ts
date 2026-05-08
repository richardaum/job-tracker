import { TemplateModule } from "@api/domains/shared/template/template.module";
import { Module } from "@nestjs/common";

import { ApplicationAiService } from "./application-ai.service";
import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";
import { OpenAIService } from "./openai.service";

@Module({
  imports: [TemplateModule],
  providers: [
    OpenAIService,
    DraftExtractionNormalizationService,
    ApplicationAiService,
  ],
  exports: [
    OpenAIService,
    DraftExtractionNormalizationService,
    ApplicationAiService,
  ],
})
export class ApplicationAiModule {}
