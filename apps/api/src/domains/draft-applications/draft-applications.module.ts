import { DatabaseModule } from "@api/database/database.module";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DraftApplicationsRepository } from "./draft-applications.repository";
import { DraftApplicationsResolver } from "./draft-applications.resolver";
import { DraftApplicationsService } from "./draft-applications.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([DraftApplicationEntity, ApplicationEntity]),
    AuthModule,
  ],
  providers: [
    DraftApplicationsRepository,
    DraftApplicationsService,
    DraftApplicationsResolver,
  ],
  exports: [DraftApplicationsService, DraftApplicationsRepository],
})
export class DraftApplicationsModule {}
