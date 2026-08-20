import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { MatchAnalysisRepository } from "./match-analysis.repository";

describe("MatchAnalysisRepository", () => {
  let store: Record<string, ReturnType<typeof vi.fn>>;
  let repo: MatchAnalysisRepository;
  beforeEach(() => {
    store = { findOne: vi.fn(), find: vi.fn(), save: vi.fn(), delete: vi.fn(), createQueryBuilder: vi.fn() };
    repo = new MatchAnalysisRepository(store as unknown as Repository<MatchAnalysisEntity>);
  });
  const entity = (): MatchAnalysisEntity => ({
    id: "new",
    jobId: "job",
    userId: "user",
    resumeId: "resume",
    generationMetadata: null,
    scoreRatio: null,
    classification: null,
    matchCount: 0,
    gapCount: 0,
    unclearCount: 0,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  it("finds analyses with optional user scope and lists normalized rows", async () => {
    store.findOne.mockResolvedValue(null);
    store.find.mockResolvedValue([]);
    await expect(repo.findById("id")).resolves.toBeNull();
    await expect(repo.findByJobId("job", "user")).resolves.toBeNull();
    await expect(repo.findAllByUserId("user")).resolves.toEqual([]);
    expect(store.findOne).toHaveBeenCalledWith({ where: { id: "id" } });
  });
  it("upserts new and existing analyses", async () => {
    const next = entity();
    const existing = { ...next, id: "old" };
    store.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(existing);
    store.save.mockResolvedValue(next);
    await repo.upsert(next);
    await repo.upsert({ ...next, id: "new" });
    expect(store.save).toHaveBeenLastCalledWith(expect.objectContaining({ id: "old" }));
  });
  it("deletes with both scopes", async () => {
    store.delete.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    await expect(repo.deleteById("id", "user")).resolves.toBe(true);
    await expect(repo.deleteByApplicationId("job")).resolves.toBe(false);
  });
  it("updates only rows in the expected status", async () => {
    const entity = { id: "id", items: [] };
    const qb = { where: vi.fn(), andWhere: vi.fn(), getOne: vi.fn() };
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.getOne.mockResolvedValueOnce(null).mockResolvedValueOnce(entity);
    store.createQueryBuilder.mockReturnValue(qb);
    store.save.mockResolvedValue(entity);
    await expect(repo.updateById("id", AsyncMetadataStatusEnum.Processing, {})).resolves.toBeNull();
    await expect(repo.updateById("id", AsyncMetadataStatusEnum.Processing, {}, "user")).resolves.toBe(entity);
  });
  it("resets stale processing analyses", async () => {
    const row = { generationMetadata: null };
    const qb = { where: vi.fn(), getMany: vi.fn() };
    qb.where.mockReturnValue(qb);
    qb.getMany.mockResolvedValue([row]);
    store.createQueryBuilder.mockReturnValue(qb);
    store.save.mockResolvedValue([row]);
    await expect(repo.resetStaleProcessing()).resolves.toBe(1);
    expect(row.generationMetadata).toMatchObject({ status: AsyncMetadataStatusEnum.Failed });
  });
});
