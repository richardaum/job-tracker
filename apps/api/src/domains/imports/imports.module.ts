import { DatabaseModule } from "@api/database/database.module";
import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportTemplateEntity } from "@api/database/entities/import-template.entity";
import { ApplicationModule } from "@api/domains/applications/applications.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { PlanRegistryService } from "@api/domains/imports/plan-registry.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ImportsRepository } from "./imports.repository";
import { ImportsResolver } from "./imports.resolver";
import { ImportsService } from "./imports.service";
import { IMPORTS_EVENTS_PUBLISHER } from "./imports-events.publisher";
import { InMemoryImportsEventsPublisher } from "./in-memory-imports-events.publisher";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ImportRunEntity, ImportTemplateEntity]),
    ApplicationModule,
    AuthModule,
  ],
  providers: [
    PlanRegistryService,
    ImportsRepository,
    ImportsService,
    ImportsResolver,
    InMemoryImportsEventsPublisher,
    {
      provide: IMPORTS_EVENTS_PUBLISHER,
      useExisting: InMemoryImportsEventsPublisher,
    },
  ],
  exports: [ImportsService],
})
export class ImportsModule {}
