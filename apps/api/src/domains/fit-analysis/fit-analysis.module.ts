import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
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
import { FitAnalysisEventBus } from "./fit-analysis-event.bus";
import { FitAnalysisEventListener } from "./fit-analysis-event.listener";
import { FitAnalysisSseController } from "./fit-analysis-sse.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FitAnalysisEntity,
      ResumeEntity,
      WorkPreferencesEntity,
    ]),
    AuthModule,
    LibAiModule,
    TemplateModule,
    ApplicationModule,
    ResumesModule,
    DraftApplicationsModule,
  ],
  controllers: [FitAnalysisSseController],
  providers: [
    FitAnalysisEventBus,
    FitAnalysisRepository,
    FitAnalysisService,
    FitAnalysisResolver,
    ApplicationFitResolver,
    DraftApplicationFitResolver,
    FitAnalysisAiService,
    FitAnalysisEventListener,
  ],
  exports: [FitAnalysisService, FitAnalysisRepository, FitAnalysisEventBus],
})
export class FitAnalysisModule {}
