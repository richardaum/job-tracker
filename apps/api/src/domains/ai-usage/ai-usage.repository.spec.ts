import { AiUsageRecordEntity } from "@api/database/entities/ai-usage-record.entity";
import { describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { AiUsageRepository } from "./ai-usage.repository";
import { AiUsageSourceEnum } from "./ai-usage-source.enum";

function createQueryBuilderMock() {
  const queryBuilder = {
    select: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    groupBy: vi.fn(),
    getRawMany: vi.fn(),
  };
  for (const method of ["select", "addSelect", "where", "andWhere", "groupBy"] as const) {
    queryBuilder[method].mockReturnValue(queryBuilder);
  }
  return queryBuilder;
}

describe("AiUsageRepository", () => {
  it("persists only the user, source, and measured token usage", async () => {
    const row = { id: "usage-1" };
    const store = { create: vi.fn().mockReturnValue(row), save: vi.fn().mockResolvedValue(row) };
    const repository = new AiUsageRepository(store as unknown as Repository<AiUsageRecordEntity>);

    await repository.record("user-1", AiUsageSourceEnum.PersonalKey, {
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
    });

    expect(store.create).toHaveBeenCalledWith({
      userId: "user-1",
      source: AiUsageSourceEnum.PersonalKey,
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
    });
    expect(store.save).toHaveBeenCalledWith(row);
  });

  it("aggregates only the requested user's records at or after the inclusive cutoff", async () => {
    const queryBuilder = createQueryBuilderMock();
    queryBuilder.getRawMany.mockResolvedValue([
      { source: AiUsageSourceEnum.Trial, inputTokens: "11", outputTokens: "7", totalTokens: "18", calls: "2" },
    ]);
    const store = { createQueryBuilder: vi.fn().mockReturnValue(queryBuilder) };
    const repository = new AiUsageRepository(store as unknown as Repository<AiUsageRecordEntity>);
    const since = new Date("2026-07-21T12:00:00.000Z");

    await expect(repository.aggregateSince("user-1", since)).resolves.toEqual([
      { source: AiUsageSourceEnum.Trial, inputTokens: 11, outputTokens: 7, totalTokens: 18, calls: 2 },
    ]);
    expect(queryBuilder.where).toHaveBeenCalledWith("usage.user_id = :userId", { userId: "user-1" });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("usage.created_at >= :since", { since });
    expect(queryBuilder.groupBy).toHaveBeenCalledWith("usage.source");
  });
});
