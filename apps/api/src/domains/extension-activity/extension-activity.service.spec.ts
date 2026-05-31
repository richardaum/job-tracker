import { ExtensionActivityRepository } from "@api/domains/extension-activity/extension-activity.repository";
import { ExtensionActivityService } from "@api/domains/extension-activity/extension-activity.service";
import type { ExtensionActivityEventBus } from "@api/domains/extension-activity/extension-activity-event.bus";
import { ExtensionActivityEventTypeEnum } from "@api/domains/extension-activity/extension-activity-event-type.enum";
import { ReportExtensionActivityInput } from "@api/domains/extension-activity/report-extension-activity.input";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ExtensionActivityService", () => {
  const repo: Pick<
    ExtensionActivityRepository,
    "create" | "listRecentByUserId"
  > = { create: vi.fn(), listRecentByUserId: vi.fn() };
  const eventBus: Pick<ExtensionActivityEventBus, "emit"> = { emit: vi.fn() };

  let service: ExtensionActivityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ExtensionActivityService(
      repo as ExtensionActivityRepository,
      eventBus as ExtensionActivityEventBus,
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
    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.objectContaining({
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
      }),
    );
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
});
