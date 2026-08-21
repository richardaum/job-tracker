import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { apiEnv } from "@api/env/server";
import { assignIfDefined } from "@api/lib/assign-if-defined";
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
    const created = this.repo.create({ userId, trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT });
    return this.repo.save(created);
  }

  async updateSettings(userId: string, input: UpdateSettingsInput): Promise<UserSettingEntity> {
    const settings = await this.getSettings(userId);
    assignIfDefined(settings, "autoFillEnabled", input.autoFillEnabled);
    assignIfDefined(settings, "autoSummaryEnabled", input.autoSummaryEnabled);
    assignIfDefined(settings, "autoMatchEnabled", input.autoMatchEnabled);
    assignIfDefined(settings, "aiEnabled", input.aiEnabled);
    assignIfDefined(settings, "duplicateWindowDays", input.duplicateWindowDays);
    assignIfDefined(settings, "lastQuickTipId", input.lastQuickTipId);
    assignIfDefined(settings, "dismissedQuickTipIds", input.dismissedQuickTipIds);
    assignIfDefined(settings, "blockedKeywords", input.blockedKeywords);
    assignIfDefined(settings, "blockedCompanies", input.blockedCompanies);
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

  async setTrialCallsLimit(userId: string, limit: number): Promise<UserSettingEntity> {
    if (limit < 0) {
      throw new GraphQLError("Trial calls limit must be zero or greater.", { extensions: { code: "BAD_USER_INPUT" } });
    }

    const settings = await this.getSettings(userId);
    settings.trialCallsLimit = limit;
    const saved = await this.repo.save(settings);
    this.eventBus.emit(new AiUsageChanged(userId, saved.trialCallsUsed, saved.openaiApiKeyEncrypted != null));
    return saved;
  }
}
