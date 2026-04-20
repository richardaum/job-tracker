import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { UserRepository } from "./users.repository";
import { UserService } from "./users.service";

@Module({
  imports: [DatabaseModule],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UsersModule {}
