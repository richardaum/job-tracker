import { DatabaseModule } from "@api/database/database.module";
import { PlanEntity } from "@api/database/entities/plan.entity";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { JobsModule } from "@api/domains/jobs/jobs.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PlanRepository } from "./plan.repository";
import { PlanResolver } from "./plan.resolver";
import { PlanService } from "./plan.service";
import { SourcesRepository } from "./sources.repository";
import { SourcesResolver } from "./sources.resolver";
import { SourcesService } from "./sources.service";
import { SourcesEventBus } from "./sources-event.bus";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      SourceRunEntity,
      SourceTemplateEntity,
      PlanEntity,
    ]),
    JobsModule,
    AuthModule,
  ],
  providers: [
    PlanRepository,
    PlanService,
    PlanResolver,
    SourcesEventBus,
    SourcesRepository,
    SourcesService,
    SourcesResolver,
  ],
  exports: [SourcesService],
})
export class SourcesModule {}
