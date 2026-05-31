import { WorkPreferencesEntity } from "@api/database/entities/work-preferences.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { WorkPreferences } from "./work-preferences.schema";

@Injectable()
export class WorkPreferencesRepository {
  constructor(
    @InjectRepository(WorkPreferencesEntity)
    private readonly repo: Repository<WorkPreferencesEntity>,
  ) {}

  async findByUserId(userId: string): Promise<WorkPreferences | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async upsert(
    userId: string,
    items: WorkPreferencesEntity["items"],
  ): Promise<WorkPreferences> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      existing.items = items;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ userId, items }));
  }
}
