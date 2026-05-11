import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserPreferencesRepository } from "./user-preferences.repository";
import { UserPreferencesResolver } from "./user-preferences.resolver";
import { UserPreferencesService } from "./user-preferences.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferencesEntity]), AuthModule],
  providers: [
    UserPreferencesRepository,
    UserPreferencesService,
    UserPreferencesResolver,
  ],
})
export class UserPreferencesModule {}
