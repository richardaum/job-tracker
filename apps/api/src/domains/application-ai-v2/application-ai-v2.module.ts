import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { TemplateModule } from "@api/domains/shared/template/template.module";
import { Module } from "@nestjs/common";

import { ApplicationAiV2Service } from "./application-ai-v2.service";
import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";

@Module({
  imports: [ApplicationAiModule, TemplateModule],
  providers: [DraftExtractionNormalizationService, ApplicationAiV2Service],
  exports: [DraftExtractionNormalizationService, ApplicationAiV2Service],
})
export class ApplicationAiV2Module {}
