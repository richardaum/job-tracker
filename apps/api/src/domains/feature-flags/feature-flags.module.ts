import { Global, Module } from "@nestjs/common";

import { FeatureFlagGuard } from "./feature-flag.guard";
import { PostHogService } from "./posthog.service";

@Global()
@Module({ providers: [PostHogService, FeatureFlagGuard], exports: [PostHogService, FeatureFlagGuard] })
export class FeatureFlagsModule {}
