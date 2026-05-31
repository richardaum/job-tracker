import { ExtensionActivityEventEntity } from "@api/database/entities/extension-activity-event.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { ExtensionActivityRepository } from "@api/domains/extension-activity/extension-activity.repository";
import { ExtensionActivityResolver } from "@api/domains/extension-activity/extension-activity.resolver";
import { ExtensionActivityService } from "@api/domains/extension-activity/extension-activity.service";
import { ExtensionActivityEventBus } from "@api/domains/extension-activity/extension-activity-event.bus";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([ExtensionActivityEventEntity]),
    AuthModule,
  ],
  providers: [
    ExtensionActivityEventBus,
    ExtensionActivityRepository,
    ExtensionActivityService,
    ExtensionActivityResolver,
  ],
  exports: [ExtensionActivityService],
})
export class ExtensionActivityModule {}
