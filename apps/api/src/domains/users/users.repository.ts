import { UserEntity } from "@api/database/entities/user.entity";
import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager, Repository } from "typeorm";

import { AuthProviderEnum } from "./auth-provider.enum";
import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";
import type { InsertAccountRepoDto, InsertUserRepoDto, SaveUserRepoDto } from "./users.repository.schema";
import type { User } from "./users.schema";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly accountsRepo: Repository<UserAccountEntity>,
  ) {}

  get manager() {
    return this.usersRepo.manager;
  }

  private users(manager?: EntityManager): Repository<UserEntity> {
    return manager?.getRepository(UserEntity) ?? this.usersRepo;
  }

  private accounts(manager?: EntityManager): Repository<UserAccountEntity> {
    return manager?.getRepository(UserAccountEntity) ?? this.accountsRepo;
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

  async findByProvider(providerName: AuthProviderEnum, providerAccountId: string): Promise<User | null> {
    const link = await this.accountsRepo.findOne({ where: { providerName, providerAccountId }, relations: ["user"] });
    return link?.user ?? null;
  }

  async findAccountByProvider(
    providerName: AuthProviderEnum,
    providerAccountId: string,
    manager?: EntityManager,
  ): Promise<UserAccountEntity | null> {
    return this.accounts(manager).findOne({ where: { providerName, providerAccountId } });
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

  async insertAccount(data: InsertAccountRepoDto, manager?: EntityManager): Promise<UserAccountEntity> {
    const row = this.accounts(manager).create(data);
    return this.accounts(manager).save(row);
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await this.usersRepo.increment({ id }, "tokenVersion", 1);
  }

  async setRefreshJti(id: string, jti: string | null): Promise<void> {
    await this.usersRepo.update({ id }, { refreshJti: jti });
  }

  async setStatus(id: string, status: UserStatusEnum): Promise<void> {
    await this.usersRepo.update({ id }, { status });
  }
}
