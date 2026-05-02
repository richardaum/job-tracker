import { DatabaseModule } from "@api/database/database.module";
import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { AuthModule } from "@api/domains/auth/auth.module";
import { ExtensionChannelModule } from "@api/domains/extension-channel/extension-channel.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ImportsRepository } from "./imports.repository";
import { ImportsResolver } from "./imports.resolver";
import { ImportsService } from "./imports.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ImportRunEntity]),
    AuthModule,
    ExtensionChannelModule,
  ],
  providers: [ImportsRepository, ImportsService, ImportsResolver],
  exports: [ImportsService],
})
export class ImportsModule {}
