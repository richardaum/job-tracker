import { tryRun } from "@job-tracker/try-run";

import { api } from "@/gql/api";
import type { LogService } from "@/domains/log/log.service";
import { ExtensionActivityEventType, type ReportExtensionActivityInput } from "@/gql/graphql";

type ExtensionActivityReporterDeps = { extensionVersion: string; browser: string };

export type ReportExtensionActivityOptions = {
  sourceRunId?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
};

export class ExtensionActivityReporterService {
  constructor(
    private readonly logService: LogService,
    private readonly deps: ExtensionActivityReporterDeps,
  ) {}

  report(type: ExtensionActivityEventType, summary: string, options?: ReportExtensionActivityOptions): void {
    const input: ReportExtensionActivityInput = {
      type,
      summary,
      sourceRunId: options?.sourceRunId ?? null,
      payload: options?.payload ?? null,
      extensionVersion: this.deps.extensionVersion,
      browser: this.deps.browser,
      ...(options?.occurredAt ? { occurredAt: options.occurredAt } : {}),
    };

    void this.send(input);
  }

  private async send(input: ReportExtensionActivityInput): Promise<void> {
    const [err] = await tryRun(api.ReportExtensionActivity({ input }));
    if (err) {
      this.logService.error("extension-activity:report-failed", { type: input.type, error: err });
    }
  }
}
