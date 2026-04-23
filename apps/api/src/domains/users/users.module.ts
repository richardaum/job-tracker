import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "@api/database/entities/user.entity";
import { DatabaseModule } from "@api/database/database.module";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UsersModule {}
