import { TemplateModule } from "@api/domains/shared/template/template.module";
import { Module } from "@nestjs/common";

import { ApplicationAiService } from "./application-ai.service";
import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";
import { OpenAIService } from "./openai.service";
import { SummaryAiService } from "./summary-ai.service";

@Module({
  imports: [TemplateModule],
  providers: [
    OpenAIService,
    DraftExtractionNormalizationService,
    ApplicationAiService,
    SummaryAiService,
  ],
  exports: [
    OpenAIService,
    DraftExtractionNormalizationService,
    ApplicationAiService,
    SummaryAiService,
  ],
})
export class ApplicationAiModule {}
