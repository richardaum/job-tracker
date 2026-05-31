import { tryRun } from "@job-tracker/try-run";

import type { ApiService } from "@/domains/api/api.service";
import type { LogService } from "@/domains/log/log.service";
import {
  ExtensionActivityEventType,
  type ReportExtensionActivityInput,
} from "@/gql/graphql";

type ExtensionActivityReporterDeps = {
  extensionVersion: string;
  browser: string;
};

export type ReportExtensionActivityOptions = {
  correlationId?: string | null;
  payload?: string | null;
  occurredAt?: string;
};

export class ExtensionActivityReporterService {
  constructor(
    private readonly apiService: ApiService,
    private readonly logService: LogService,
    private readonly deps: ExtensionActivityReporterDeps,
  ) {}

  report(
    type: ExtensionActivityEventType,
    summary: string,
    options?: ReportExtensionActivityOptions,
  ): void {
    const input: ReportExtensionActivityInput = {
      type,
      summary,
      correlationId: options?.correlationId ?? null,
      payload: options?.payload ?? null,
      extensionVersion: this.deps.extensionVersion,
      browser: this.deps.browser,
      ...(options?.occurredAt ? { occurredAt: options.occurredAt } : {}),
    };

    void this.send(input);
  }

  private async send(input: ReportExtensionActivityInput): Promise<void> {
    const [err] = await tryRun(this.apiService.reportExtensionActivity(input));
    if (err) {
      this.logService.error("extension-activity:report-failed", {
        type: input.type,
        error: err,
      });
    }
  }
}
