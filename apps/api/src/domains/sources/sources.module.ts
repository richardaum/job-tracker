import { DatabaseModule } from "@api/database/database.module";
import { SourceRunEntity } from "@api/database/entities/source-run.entity";
import { SourceTemplateEntity } from "@api/database/entities/source-template.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { JobsModule } from "@api/domains/jobs/jobs.module";
import { SourceProfileRegistryService } from "@api/domains/sources/source-profile-registry.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InMemorySourcesEventsPublisher } from "./in-memory-sources-events.publisher";
import { SourcesRepository } from "./sources.repository";
import { SourcesResolver } from "./sources.resolver";
import { SourcesService } from "./sources.service";
import { SOURCES_EVENTS_PUBLISHER } from "./sources-events.publisher";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([SourceRunEntity, SourceTemplateEntity]),
    JobsModule,
    AuthModule,
  ],
  providers: [
    SourceProfileRegistryService,
    SourcesRepository,
    SourcesService,
    SourcesResolver,
    InMemorySourcesEventsPublisher,
    {
      provide: SOURCES_EVENTS_PUBLISHER,
      useExisting: InMemorySourcesEventsPublisher,
    },
  ],
  exports: [SourcesService],
})
export class SourcesModule {}
