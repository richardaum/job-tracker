import { DatabaseModule } from "@api/database/database.module";
import { UserEntity } from "@api/database/entities/user.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RegistrationEmailService } from "./registration-email.service";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [UserRepository, RegistrationEmailService, UserService],
  exports: [UserService],
})
export class UsersModule {}
