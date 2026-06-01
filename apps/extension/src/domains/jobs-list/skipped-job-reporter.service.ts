export class SkippedJobReporterService {
  reportSkipped(summary: string, sourceRunId: string, sourceFieldContent?: string): void {
    chrome.runtime.sendMessage({ kind: "report.skipped", summary, sourceRunId, sourceFieldContent }).catch(() => {});
  }
}
