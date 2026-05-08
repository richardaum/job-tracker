import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { TemplateModule } from "@api/domains/shared/template/template.module";
import { Module } from "@nestjs/common";

import { ApplicationAiService } from "./application-ai.service";
import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";

@Module({
  imports: [ApplicationAiModule, TemplateModule],
  providers: [DraftExtractionNormalizationService, ApplicationAiService],
  exports: [DraftExtractionNormalizationService, ApplicationAiService],
})
export class ApplicationAiV2Module {}
