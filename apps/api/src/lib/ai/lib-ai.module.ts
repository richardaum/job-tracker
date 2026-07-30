import { TemplateModule } from "@api/domains/shared/template/template.module";
import { SettingsModule } from "@api/domains/settings/settings.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { AiAccessService } from "./ai-access.service";
import { AiBaseService } from "./ai-base.service";
import { LocationInferenceService } from "./location-inference.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";
import { RestructureJDService } from "./restructure-jd.service";
import { RewriteTextService } from "./rewrite-text.service";
import { EncryptedColumnTransformer } from "@api/lib/crypto/encrypted-column.transformer";

@Module({
  imports: [TemplateModule, TypeOrmModule.forFeature([UserSettingEntity]), SettingsModule],
  providers: [
    OpenAIClient,
    PromptRendererService,
    AiBaseService,
    AiAccessService,
    EncryptedColumnTransformer,
    RewriteTextService,
    RestructureJDService,
    LocationInferenceService,
  ],
  exports: [
    OpenAIClient,
    PromptRendererService,
    AiBaseService,
    AiAccessService,
    RewriteTextService,
    RestructureJDService,
    LocationInferenceService,
  ],
})
export class LibAiModule {}
