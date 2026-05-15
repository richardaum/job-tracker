import { AuthModule } from "@api/domains/auth/auth.module";
import { LibAiModule } from "@api/lib/ai";
import { Module } from "@nestjs/common";

import { AiResolver } from "./ai.resolver";

@Module({ imports: [LibAiModule, AuthModule], providers: [AiResolver] })
export class AiModule {}
