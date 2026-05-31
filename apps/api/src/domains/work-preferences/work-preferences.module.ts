import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { WorkPreferencesRepository } from "./work-preferences.repository";
import { WorkPreferencesResolver } from "./work-preferences.resolver";
import { WorkPreferencesService } from "./work-preferences.service";

@Module({
  imports: [TypeOrmModule.forFeature([WorkPreferencesEntity]), AuthModule],
  providers: [WorkPreferencesRepository, WorkPreferencesService, WorkPreferencesResolver],
})
export class WorkPreferencesModule {}
