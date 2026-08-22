import { UserEntity } from "@api/database/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager, Repository } from "typeorm";

import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";
import type { InsertUserRepoDto, SaveUserRepoDto } from "./users.repository.schema";
import type { User } from "./users.schema";

@Injectable()
export class UserRepository {
  constructor(@InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>) {}

  private users(manager?: EntityManager): Repository<UserEntity> {
    return manager?.getRepository(UserEntity) ?? this.usersRepo;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find({ order: { createdAt: "DESC" } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findActiveAdmins(): Promise<User[]> {
    return this.usersRepo.find({ where: { role: RoleEnum.Admin, status: UserStatusEnum.Active } });
  }

  async saveUser(user: SaveUserRepoDto, manager?: EntityManager): Promise<User> {
    const repo = this.users(manager);
    const existing = await repo.findOneByOrFail({ id: user.id });
    return repo.save(repo.merge(existing, user));
  }

  async insertUser(data: InsertUserRepoDto, manager?: EntityManager): Promise<User> {
    const row = this.users(manager).create(data);
    return this.users(manager).save(row);
  }

  async setStatus(id: string, status: UserStatusEnum): Promise<void> {
    await this.usersRepo.update({ id }, { status });
  }
}
