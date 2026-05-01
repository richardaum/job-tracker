import { ApplicationAiModule } from "@api/domains/application-ai/application-ai.module";
import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";

import { AiResolver } from "./ai.resolver";
import { AiService } from "./ai.service";

@Module({
  imports: [ApplicationAiModule, AuthModule],
  providers: [AiResolver, AiService],
})
export class AiModule {}
