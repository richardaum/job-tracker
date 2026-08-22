import { apiEnv } from "@api/env/server";
import { Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { tryRun } from "@job-tracker/try-run";
import { PostHog } from "posthog-node";

@Injectable()
export class PostHogService implements OnModuleDestroy {
  private readonly logger = new Logger(PostHogService.name);
  private readonly client: PostHog | undefined;

  constructor() {
    if (!apiEnv.POSTHOG_PROJECT_API_KEY) return;

    this.client = new PostHog(apiEnv.POSTHOG_PROJECT_API_KEY, {
      host: apiEnv.POSTHOG_HOST,
      personalApiKey: apiEnv.POSTHOG_PERSONAL_API_KEY,
    });
  }

  async isFeatureEnabled(flagKey: string, distinctId: string): Promise<boolean> {
    if (!this.client) return false;

    const [error, flags] = await tryRun(
      this.client.evaluateFlags(distinctId, { personProperties: { deploymentEnvironment: apiEnv.NODE_ENV } }),
    );
    if (error) {
      this.logger.warn(`failed to evaluate flag=${flagKey} distinctId=${distinctId}: ${String(error)}`);
      return false;
    }
    return flags.isEnabled(flagKey);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.shutdown();
  }
}
