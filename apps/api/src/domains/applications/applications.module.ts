import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { DraftApplicationsModule } from "@api/domains/draft-applications/draft-applications.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SummaryAiService } from "./ai/summary-ai.service";
import { ApplicationEventBus } from "./application-event.bus";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationResolver } from "./applications.resolver";
import { ApplicationService } from "./applications.service";
import { SalaryService } from "./salary.service";
import { SummaryService } from "./summary.service";
import { SummaryEventListener } from "./summary-event.listener";
import { TagService } from "./tag.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationNoteEntity,
      ApplicationStageEventEntity,
      CompanyEntity,
      FitAnalysisEntity,
      SourceRunEntity,
    ]),
    AuthModule,
    CompaniesModule,
    DraftApplicationsModule,
    LibAiModule,
  ],
  providers: [
    ApplicationEventBus,
    ApplicationRepository,
    ApplicationService,
    ApplicationResolver,
    SalaryService,
    SummaryEventListener,
    SummaryService,
    TagService,
    SummaryAiService,
  ],
  exports: [ApplicationService, ApplicationRepository, ApplicationEventBus],
})
export class ApplicationModule {}
