import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { ApplicationModule } from "@api/domains/applications/applications.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { DraftApplicationsModule } from "@api/domains/draft-applications/draft-applications.module";
import { ResumesModule } from "@api/domains/resumes/resumes.module";
import { TemplateModule } from "@api/domains/shared/template/template.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FitAnalysisRepository } from "./fit-analysis.repository";
import {
  ApplicationFitResolver,
  DraftApplicationFitResolver,
  FitAnalysisResolver,
} from "./fit-analysis.resolver";
import { FitAnalysisService } from "./fit-analysis.service";
import { FitAnalysisAiService } from "./fit-analysis-ai.service";
import { FitAnalysisEventListener } from "./fit-analysis-event.listener";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FitAnalysisEntity,
      ResumeEntity,
      UserPreferencesEntity,
    ]),
    AuthModule,
    LibAiModule,
    TemplateModule,
    ApplicationModule,
    ResumesModule,
    DraftApplicationsModule,
  ],
  providers: [
    FitAnalysisRepository,
    FitAnalysisService,
    FitAnalysisResolver,
    ApplicationFitResolver,
    DraftApplicationFitResolver,
    FitAnalysisAiService,
    FitAnalysisEventListener,
  ],
  exports: [FitAnalysisService, FitAnalysisRepository],
})
export class FitAnalysisModule {}
