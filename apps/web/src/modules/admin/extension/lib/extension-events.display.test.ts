import { describe, expect, it } from "vitest";

import {
  ExtensionActivityEventType,
  SourceRunEventType,
  SourceRunStatus,
} from "@/gql/hooks";

import {
  countInFlightActivityEvents,
  countInFlightAdminEvents,
  inFlightLabel,
  mapSourceRunToExtensionEvent,
  mergeExtensionAdminEvents,
  sourceRunSummary,
} from "./extension-events.display";

function sourceRun(
  overrides: Partial<Parameters<typeof mapSourceRunToExtensionEvent>[0]> = {},
) {
  return {
    id: "run-1",
    templateId: "template-1",
    sourceProfileId: "remoteyeah",
    surfaceUrl: "https://example.com/jobs",
    status: SourceRunStatus.Running,
    startedAt: "2026-05-25T12:00:00.000Z",
    sourceProfile: "RemoteYeah",
    ...overrides,
  };
}

describe("extension-events.display", () => {
  it("builds summary from profile and surface URL", () => {
    expect(sourceRunSummary(sourceRun())).toBe(
      "RemoteYeah · https://example.com/jobs",
    );
  });

  it("merges source runs and activity events by occurredAt", () => {
    const events = mergeExtensionAdminEvents(
      [sourceRun({ id: "run-old", startedAt: "2026-05-25T10:00:00.000Z" })],
      [
        {
          id: "act-new",
          type: ExtensionActivityEventType.ImportJobStarted,
          summary: "LinkedIn page",
          correlationId: "import-1",
          occurredAt: "2026-05-25T12:00:00.000Z",
        },
      ],
    );

    expect(events.map((event) => event.id)).toEqual(["act-new", "run-old"]);
  });

  it("counts in-flight source runs and open activities", () => {
    const events = mergeExtensionAdminEvents(
      [
        sourceRun({ id: "running", status: SourceRunStatus.Running }),
        sourceRun({ id: "done", status: SourceRunStatus.Completed }),
      ],
      [
        {
          id: "act-1",
          type: ExtensionActivityEventType.ImportJobStarted,
          summary: "Import",
          correlationId: "import-1",
          occurredAt: "2026-05-25T11:00:00.000Z",
        },
        {
          id: "act-2",
          type: ExtensionActivityEventType.ImportJobCompleted,
          summary: "Import",
          correlationId: "import-1",
          occurredAt: "2026-05-25T12:00:00.000Z",
        },
      ],
    );

    expect(countInFlightAdminEvents(events)).toBe(1);
    expect(inFlightLabel(1)).toBe("1 in flight");
  });

  it("treats open activity correlation as in flight", () => {
    const count = countInFlightActivityEvents([
      {
        kind: "activity",
        id: "act-1",
        type: ExtensionActivityEventType.SourceRunStarted,
        summary: "RemoteYeah",
        correlationId: "run-1",
        occurredAt: "2026-05-25T12:00:00.000Z",
      },
    ]);

    expect(count).toBe(1);
  });

  it("maps source runs to extension events", () => {
    expect(mapSourceRunToExtensionEvent(sourceRun())).toEqual({
      kind: "source_run",
      id: "run-1",
      type: SourceRunEventType.SourceRunCreated,
      status: SourceRunStatus.Running,
      occurredAt: "2026-05-25T12:00:00.000Z",
      summary: "RemoteYeah · https://example.com/jobs",
    });
  });
});
