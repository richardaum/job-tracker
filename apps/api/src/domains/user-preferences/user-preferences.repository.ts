import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserPreferences } from "./user-preferences.schema";

@Injectable()
export class UserPreferencesRepository {
  constructor(
    @InjectRepository(UserPreferencesEntity)
    private readonly repo: Repository<UserPreferencesEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async upsert(
    userId: string,
    items: UserPreferencesEntity["items"],
  ): Promise<UserPreferences> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      Object.assign(existing, { items });
      return this.repo.save(existing);
    }
    const prefs = this.repo.create({ userId, items });
    return this.repo.save(prefs);
  }
}
