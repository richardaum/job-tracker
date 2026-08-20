import { ExtensionActivityEventEntity } from "@api/database/entities/extension-activity-event.entity";
import { ExtensionActivityEventTypeEnum } from "@api/domains/extension-activity/extension-activity-event-type.enum";
import { describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { ExtensionActivityRepository } from "./extension-activity.repository";

describe("ExtensionActivityRepository", () => {
  it("persists normalized optional fields and lists newest activity first", async () => {
    const qb = { where: vi.fn(), orderBy: vi.fn(), addOrderBy: vi.fn(), limit: vi.fn(), getMany: vi.fn() };
    qb.where.mockReturnValue(qb);
    qb.orderBy.mockReturnValue(qb);
    qb.addOrderBy.mockReturnValue(qb);
    qb.limit.mockReturnValue(qb);
    qb.getMany.mockResolvedValue([]);
    const store = { create: vi.fn(), save: vi.fn(), createQueryBuilder: vi.fn().mockReturnValue(qb) };
    const row = { id: "event" };
    store.create.mockReturnValue(row);
    store.save.mockResolvedValue(row);
    const repo = new ExtensionActivityRepository(store as unknown as Repository<ExtensionActivityEventEntity>);
    await expect(
      repo.create("user", {
        type: ExtensionActivityEventTypeEnum.SourceRunStarted,
        summary: "Created",
        occurredAt: new Date(),
      }),
    ).resolves.toBe(row);
    await expect(repo.listRecentByUserId("user", 20)).resolves.toEqual([]);
    expect(store.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user", sourceRunId: null, payload: null, browser: null }),
    );
    expect(qb.orderBy).toHaveBeenCalledWith("event.occurred_at", "DESC");
  });
});
