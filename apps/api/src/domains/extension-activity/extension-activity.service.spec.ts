import { ExtensionActivityRepository } from "@api/domains/extension-activity/extension-activity.repository";
import { ExtensionActivityService } from "@api/domains/extension-activity/extension-activity.service";
import { ExtensionActivityEventTypeEnum } from "@api/domains/extension-activity/extension-activity-event-type.enum";
import { ExtensionActivityEventsPublisher } from "@api/domains/extension-activity/extension-activity-events.publisher";
import { ReportExtensionActivityInput } from "@api/domains/extension-activity/report-extension-activity.input";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ExtensionActivityService", () => {
  const repo: Pick<
    ExtensionActivityRepository,
    "create" | "listRecentByUserId"
  > = { create: vi.fn(), listRecentByUserId: vi.fn() };
  const eventsPublisher: ExtensionActivityEventsPublisher = {
    publish: vi.fn(),
    subscribe: vi.fn(),
  };

  let service: ExtensionActivityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ExtensionActivityService(
      repo as ExtensionActivityRepository,
      eventsPublisher,
    );
  });

  it("reportActivity persists and publishes", async () => {
    const occurredAt = new Date("2026-05-25T12:00:00.000Z");
    vi.mocked(repo.create).mockResolvedValue({
      id: "evt-1",
      userId: "user-1",
      type: ExtensionActivityEventTypeEnum.SourceRunStarted,
      summary: "RemoteYeah run started",
      correlationId: "run-1",
      payload: null,
      extensionVersion: "1.0.0",
      browser: "Chrome",
      occurredAt,
      createdAt: occurredAt,
    });

    const input: ReportExtensionActivityInput = {
      type: ExtensionActivityEventTypeEnum.SourceRunStarted,
      summary: "RemoteYeah run started",
      correlationId: "run-1",
      extensionVersion: "1.0.0",
      browser: "Chrome",
    };

    const result = await service.reportActivity("user-1", input);

    expect(repo.create).toHaveBeenCalledWith("user-1", {
      type: ExtensionActivityEventTypeEnum.SourceRunStarted,
      summary: "RemoteYeah run started",
      correlationId: "run-1",
      payload: null,
      extensionVersion: "1.0.0",
      browser: "Chrome",
      occurredAt: expect.any(Date),
    });
    expect(eventsPublisher.publish).toHaveBeenCalledWith({
      userId: "user-1",
      payload: {
        id: "evt-1",
        type: ExtensionActivityEventTypeEnum.SourceRunStarted,
        summary: "RemoteYeah run started",
        correlationId: "run-1",
        payload: null,
        extensionVersion: "1.0.0",
        browser: "Chrome",
        occurredAt,
      },
    });
    expect(result.id).toBe("evt-1");
  });

  it("reportActivity rejects blank summary", async () => {
    await expect(
      service.reportActivity("user-1", {
        type: ExtensionActivityEventTypeEnum.AuthFailed,
        summary: "   ",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("activityEvents yields only events for the current user", async () => {
    const payload = {
      id: "evt-1",
      type: ExtensionActivityEventTypeEnum.ImportJobCompleted,
      summary: "Imported LinkedIn page",
      correlationId: null,
      payload: null,
      extensionVersion: null,
      browser: null,
      occurredAt: new Date("2026-05-25T12:00:00.000Z"),
    };

    vi.mocked(eventsPublisher.subscribe).mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield { userId: "other-user", payload };
        yield { userId: "user-1", payload };
      },
    });

    const iterator = service.activityEvents("user-1")[Symbol.asyncIterator]();
    const first = await iterator.next();

    expect(first.value).toEqual({ extensionActivityEvents: payload });
    expect(await iterator.next()).toEqual({ value: undefined, done: true });
  });
});
