export class SkippedJobReporterService {
  reportSkipped(summary: string, sourceRunId: string): void {
    chrome.runtime.sendMessage({ kind: "report.skipped", summary, sourceRunId }).catch(() => {});
  }
}
