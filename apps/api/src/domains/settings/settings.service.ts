import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GraphQLError } from "graphql";
import { Repository } from "typeorm";

import OpenAI from "openai";
import type { UpdateSettingsInput } from "./update-settings.input";
import { AI_ERROR_CODES } from "@api/lib/ai/ai-errors.constants";
import { SettingsEventBus } from "./settings-event.bus";
import { AiUsageChanged } from "./settings.events";
import { tryRun } from "@job-tracker/try-run";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettingEntity)
    private readonly repo: Repository<UserSettingEntity>,
    private readonly eventBus: SettingsEventBus,
  ) {}

  async getSettings(userId: string): Promise<UserSettingEntity> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }
    const created = this.repo.create({ userId });
    return this.repo.save(created);
  }

  async updateSettings(userId: string, input: UpdateSettingsInput): Promise<UserSettingEntity> {
    const settings = await this.getSettings(userId);
    Object.assign(settings, input);
    return this.repo.save(settings);
  }

  async saveOpenAiKey(userId: string, key: string): Promise<UserSettingEntity> {
    const client = new OpenAI({ apiKey: key });
    const [err] = await tryRun(client.models.list());
    if (err) {
      throw new GraphQLError("The provided OpenAI key is invalid.", {
        extensions: { code: AI_ERROR_CODES.AI_KEY_INVALID },
      });
    }

    const settings = await this.getSettings(userId);
    settings.openaiApiKeyEncrypted = key;
    const saved = await this.repo.save(settings);
    this.eventBus.emit(new AiUsageChanged(userId, saved.trialCallsUsed, true));
    return saved;
  }

  async removeOpenAiKey(userId: string): Promise<UserSettingEntity> {
    const settings = await this.getSettings(userId);
    settings.openaiApiKeyEncrypted = null;
    const saved = await this.repo.save(settings);
    this.eventBus.emit(new AiUsageChanged(userId, saved.trialCallsUsed, false));
    return saved;
  }
}
