import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SettingsEventBus } from "./settings-event.bus";
import { SettingsEventsResolver } from "./settings-events.resolver";
import { SettingsResolver } from "./settings.resolver";
import { SettingsService } from "./settings.service";
import { UserSettingFieldsResolver } from "./user-setting.fields.resolver";

@Module({
  imports: [TypeOrmModule.forFeature([UserSettingEntity]), AuthModule],
  providers: [SettingsService, SettingsResolver, UserSettingFieldsResolver, SettingsEventBus, SettingsEventsResolver],
  exports: [SettingsService, SettingsEventBus],
})
export class SettingsModule {}
