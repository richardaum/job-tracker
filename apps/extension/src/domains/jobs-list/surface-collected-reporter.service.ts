export class SurfaceCollectedReporterService {
  reportSurfaceCollected(summary: string, sourceRunId: string): void {
    chrome.runtime.sendMessage({ kind: "report.surface-collected", summary, sourceRunId }).catch(() => {});
  }
}
