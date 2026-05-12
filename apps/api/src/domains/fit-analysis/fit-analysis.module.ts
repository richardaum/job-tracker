import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { ApplicationModule } from "@api/domains/applications/applications.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { TemplateModule } from "@api/domains/shared/template/template.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FitAnalysisRepository } from "./fit-analysis.repository";
import {
  ApplicationFitResolver,
  FitAnalysisResolver,
} from "./fit-analysis.resolver";
import { FitAnalysisService } from "./fit-analysis.service";
import { FitAnalysisAiService } from "./fit-analysis-ai.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FitAnalysisEntity,
      ResumeEntity,
      UserPreferencesEntity,
    ]),
    AuthModule,
    ApplicationAiModule,
    TemplateModule,
    ApplicationModule,
  ],
  providers: [
    FitAnalysisRepository,
    FitAnalysisService,
    FitAnalysisResolver,
    ApplicationFitResolver,
    FitAnalysisAiService,
  ],
})
export class FitAnalysisModule {}
