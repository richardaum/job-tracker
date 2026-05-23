import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { ResumeEntity } from "@api/database/entities/resume.entity";
import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { JobsModule } from "@api/domains/jobs/jobs.module";
import { ResumesModule } from "@api/domains/resumes/resumes.module";
import { TemplateModule } from "@api/domains/shared/template/template.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MatchAnalysisRepository } from "./match-analysis.repository";
import {
  JobMatchResolver,
  MatchAnalysisResolver,
} from "./match-analysis.resolver";
import { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisAiService } from "./match-analysis-ai.service";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";
import { MatchAnalysisEventListener } from "./match-analysis-event.listener";
import { MatchAnalysisSseController } from "./match-analysis-sse.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MatchAnalysisEntity,
      ResumeEntity,
      WorkPreferencesEntity,
    ]),
    AuthModule,
    LibAiModule,
    TemplateModule,
    JobsModule,
    ResumesModule,
  ],
  controllers: [MatchAnalysisSseController],
  providers: [
    MatchAnalysisEventBus,
    MatchAnalysisRepository,
    MatchAnalysisService,
    MatchAnalysisResolver,
    JobMatchResolver,
    MatchAnalysisAiService,
    MatchAnalysisEventListener,
  ],
  exports: [
    MatchAnalysisService,
    MatchAnalysisRepository,
    MatchAnalysisEventBus,
  ],
})
export class MatchAnalysisModule {}
