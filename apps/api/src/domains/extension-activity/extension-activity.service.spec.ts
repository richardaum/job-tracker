import { ExtensionActivityEventTypeEnum } from "@api/domains/extension-activity/extension-activity-event-type.enum";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExtensionActivityEventBus } from "./extension-activity-event.bus";
import { ExtensionActivityRepository } from "./extension-activity.repository";
import { ExtensionActivityService } from "./extension-activity.service";

describe("ExtensionActivityService", () => {
  let repo: { listRecentByUserId: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let bus: { emit: ReturnType<typeof vi.fn> };
  let service: ExtensionActivityService;
  beforeEach(() => {
    repo = { listRecentByUserId: vi.fn(), create: vi.fn() };
    bus = { emit: vi.fn() };
    service = new ExtensionActivityService(
      repo as unknown as ExtensionActivityRepository,
      bus as unknown as ExtensionActivityEventBus,
    );
  });
  it("normalizes list limits", async () => {
    repo.listRecentByUserId.mockResolvedValue([]);
    await service.listActivityEvents("u");
    await service.listActivityEvents("u", 999);
    await service.listActivityEvents("u", 0);
    expect(repo.listRecentByUserId).toHaveBeenNthCalledWith(1, "u", 100);
    expect(repo.listRecentByUserId).toHaveBeenNthCalledWith(2, "u", 500);
    expect(repo.listRecentByUserId).toHaveBeenNthCalledWith(3, "u", 1);
  });
  it("rejects empty summaries and reports persisted activity", async () => {
    await expect(
      service.reportActivity("u", { type: ExtensionActivityEventTypeEnum.SourceRunStarted, summary: "  " }),
    ).rejects.toThrow(BadRequestException);
    const row = {
      id: "e",
      type: ExtensionActivityEventTypeEnum.SourceRunStarted,
      summary: "Done",
      sourceRunId: null,
      payload: null,
      extensionVersion: null,
      browser: null,
      occurredAt: new Date(),
    };
    repo.create.mockResolvedValue(row);
    await expect(service.reportActivity("u", { type: row.type, summary: " Done " })).resolves.toMatchObject({
      summary: "Done",
    });
    expect(bus.emit).toHaveBeenCalledOnce();
  });
});
