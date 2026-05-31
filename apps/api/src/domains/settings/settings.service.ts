import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { UpdateSettingsInput } from "./update-settings.input";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettingEntity)
    private readonly repo: Repository<UserSettingEntity>,
  ) {}

  async getSettings(userId: string): Promise<UserSettingEntity> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }
    const created = this.repo.create({ userId });
    return this.repo.save(created);
  }

  async updateSettings(
    userId: string,
    input: UpdateSettingsInput,
  ): Promise<UserSettingEntity> {
    const settings = await this.getSettings(userId);
    Object.assign(settings, input);
    return this.repo.save(settings);
  }
}
