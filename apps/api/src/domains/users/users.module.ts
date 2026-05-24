import { DatabaseModule } from "@api/database/database.module";
import { UserEntity } from "@api/database/entities/user.entity";
import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { UserTypeFieldsResolver } from "./user-type.fields.resolver";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([UserEntity, UserAccountEntity]),
  ],
  providers: [
    ActiveUserCacheService,
    UserRepository,
    UserService,
    UserTypeFieldsResolver,
  ],
  exports: [UserService],
})
export class UsersModule {}
