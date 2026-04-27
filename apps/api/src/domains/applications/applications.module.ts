import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { DatabaseModule } from "@api/database/database.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { ApplicationRepository } from "./applications.repository";
import { ApplicationService } from "./applications.service";
import { ApplicationResolver } from "./applications.resolver";
import { CompaniesModule } from "@api/domains/companies/companies.module";
import { CompensationService } from "./compensation.service";
import { TagService } from "./tag.service";
import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { CompanyAiModule } from "@api/domains/company-ai/company-ai.module";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationStageEventEntity,
      ApplicationNoteEntity,
      CompanyEntity,
    ]),
    AuthModule,
    CompaniesModule,
    ApplicationAiModule,
    CompanyAiModule,
  ],
  providers: [
    ApplicationRepository,
    ApplicationService,
    ApplicationResolver,
    CompensationService,
    TagService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
