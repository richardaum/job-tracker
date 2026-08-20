import { apiEnv } from "@api/env/server";
import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GraphQLError } from "graphql";
import { Repository } from "typeorm";

import { SettingsEventBus } from "@api/domains/settings/settings-event.bus";
import { AiUsageChanged } from "@api/domains/settings/settings.events";
import { AI_ERROR_CODES } from "./ai-errors.constants";

export type AiAccess = { key: string; source: AiUsageSourceEnum };

/**
 * Resolves the effective OpenAI API key for a user, enforcing access gating:
 * - AI toggle off → AI_DISABLED_BY_USER error
 * - Personal key present → return decrypted key (no quota mutation)
 * - No personal key, quota remaining → atomically increment quota, return system key
 * - No personal key, quota exhausted → AI_KEY_REQUIRED error
 */
@Injectable()
export class AiAccessService {
  constructor(
    @InjectRepository(UserSettingEntity) private readonly settings: Repository<UserSettingEntity>,
    private readonly eventBus: SettingsEventBus,
  ) {}

  /**
   * Same gating rules as {@link resolveClientKey} but read-only — does not
   * decrypt a personal key or mutate the trial quota. Used to fail fast on
   * AI-gated actions that queue async work (e.g. summary/match generation),
   * so the gating error surfaces synchronously instead of being swallowed
   * once the work moves off the request/response cycle.
   */
  async checkAccess(userId: string): Promise<void> {
    const setting = await this.settings.findOneByOrFail({ userId });

    if (!setting.aiEnabled) {
      throw new GraphQLError("AI is turned off for your account.", {
        extensions: { code: AI_ERROR_CODES.AI_DISABLED_BY_USER },
      });
    }

    if (setting.openaiApiKeyEncrypted) return;

    if (setting.trialCallsUsed >= setting.trialCallsLimit) {
      throw new GraphQLError("Your AI trial is over — add your own OpenAI key.", {
        extensions: { code: AI_ERROR_CODES.AI_KEY_REQUIRED },
      });
    }
  }

  async resolveClientAccess(userId: string): Promise<AiAccess> {
    const setting = await this.settings.findOneByOrFail({ userId });

    if (!setting.aiEnabled) {
      throw new GraphQLError("AI is turned off for your account.", {
        extensions: { code: AI_ERROR_CODES.AI_DISABLED_BY_USER },
      });
    }

    if (setting.openaiApiKeyEncrypted) {
      return { key: setting.openaiApiKeyEncrypted, source: AiUsageSourceEnum.PersonalKey };
    }

    const { affected } = await this.settings
      .createQueryBuilder()
      .update(UserSettingEntity)
      .set({ trialCallsUsed: () => '"trial_calls_used" + 1' })
      .where("user_id = :userId AND trial_calls_used < trial_calls_limit", { userId })
      .execute();

    if (!affected) {
      throw new GraphQLError("Your AI trial is over — add your own OpenAI key.", {
        extensions: { code: AI_ERROR_CODES.AI_KEY_REQUIRED },
      });
    }

    this.eventBus.emit(new AiUsageChanged(userId, setting.trialCallsUsed + 1, false));
    return { key: apiEnv.OPENAI_API_KEY!, source: AiUsageSourceEnum.Trial };
  }

  async resolveClientKey(userId: string): Promise<string> {
    const access = await this.resolveClientAccess(userId);
    return access.key;
  }
}
