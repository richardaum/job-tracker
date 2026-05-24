import { UserEntity } from "@api/database/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { NewUser, User } from "./users.schema";

type UpdateUserProfileDto = Pick<NewUser, "email" | "name" | "avatarUrl">;

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.repo.findOne({ where: { googleId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async create(dto: NewUser): Promise<User> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async updateProfile(
    id: string,
    dto: UpdateUserProfileDto,
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await this.repo.increment({ id }, "tokenVersion", 1);
  }

  async setRefreshJti(id: string, jti: string | null): Promise<void> {
    await this.repo.update({ id }, { refreshJti: jti });
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.repo.update({ id }, { active });
  }
}
