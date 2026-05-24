import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SettingsResolver } from "./settings.resolver";
import { SettingsService } from "./settings.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserSettingEntity]), AuthModule],
  providers: [SettingsService, SettingsResolver],
  exports: [SettingsService],
})
export class SettingsModule {}
