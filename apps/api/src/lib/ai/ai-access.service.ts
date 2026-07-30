import { apiEnv } from "@api/env/server";
import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GraphQLError } from "graphql";
import { Repository } from "typeorm";

import { EncryptedColumnTransformer } from "@api/lib/crypto/encrypted-column.transformer";
import { SettingsEventBus } from "@api/domains/settings/settings-event.bus";
import { AiUsageChanged } from "@api/domains/settings/settings.events";
import { AI_ERROR_CODES } from "./ai-errors.constants";

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
    private readonly encryption: EncryptedColumnTransformer,
    private readonly eventBus: SettingsEventBus,
  ) {}

  async resolveClientKey(userId: string): Promise<string> {
    const setting = await this.settings.findOneByOrFail({ userId });

    if (!setting.aiEnabled) {
      throw new GraphQLError("AI is turned off for your account.", {
        extensions: { code: AI_ERROR_CODES.AI_DISABLED_BY_USER },
      });
    }

    if (setting.openaiApiKeyEncrypted) {
      const decrypted = this.encryption.from(setting.openaiApiKeyEncrypted);
      if (!decrypted) {
        throw new GraphQLError("Failed to decrypt personal OpenAI key.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      return decrypted;
    }

    const { affected } = await this.settings
      .createQueryBuilder()
      .update(UserSettingEntity)
      .set({ trialCallsUsed: () => '"trial_calls_used" + 1' })
      .where("user_id = :userId AND trial_calls_used < :limit", { userId, limit: apiEnv.TRIAL_AI_CALL_LIMIT })
      .execute();

    if (!affected) {
      throw new GraphQLError("Your AI trial is over — add your own OpenAI key.", {
        extensions: { code: AI_ERROR_CODES.AI_KEY_REQUIRED },
      });
    }

    this.eventBus.emit(new AiUsageChanged(userId, setting.trialCallsUsed + 1, false));
    return apiEnv.OPENAI_API_KEY!;
  }
}
