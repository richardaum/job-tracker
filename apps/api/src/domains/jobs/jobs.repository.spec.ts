import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository } from "./jobs.repository";
import type { Job } from "./jobs.schema";
import { JobsListQuery } from "./jobs-list.query";

function makeSubQueryBuilder(getQuerySql = "(SELECT sq)") {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    getQuery: vi.fn().mockReturnValue(getQuerySql),
  };
}

function makeMainJobsQb(returnedRows: Job[]) {
  const sub = makeSubQueryBuilder();
  return {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    subQuery: vi.fn(() => sub),
    getMany: vi.fn().mockResolvedValue(returnedRows),
    innerJoin: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
  };
}

describe("JobsRepository", () => {
  let jobsRepo: Pick<
    Repository<JobEntity>,
    "findOne" | "create" | "save" | "update" | "delete" | "createQueryBuilder" | "find" | "manager"
  >;
  let stageEventsRepo: Pick<
    Repository<JobStageEventEntity>,
    "findOne" | "create" | "save" | "delete" | "createQueryBuilder" | "find"
  >;

  beforeEach(() => {
    jobsRepo = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createQueryBuilder: vi.fn(),
      find: vi.fn(),
      manager: { createQueryBuilder: vi.fn() } as unknown as import("typeorm").EntityManager,
    };

    stageEventsRepo = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      createQueryBuilder: vi.fn(),
      find: vi.fn(),
    };
  });

  it("findOneByIdAndUserId loads company relation", async () => {
    const row = { id: "j1", userId: "u1" } as Job;
    vi.mocked(jobsRepo.findOne).mockResolvedValue(row as JobEntity);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const result = await repo.findOneByIdAndUserId("j1", "u1");

    expect(jobsRepo.findOne).toHaveBeenCalledWith({ where: { id: "j1", userId: "u1" }, relations: ["company"] });
    expect(result).toBe(row);
  });

  it("findAllByUserId without filter calls getMany on ordered query", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1");

    expect(jobsRepo.createQueryBuilder).toHaveBeenCalledWith("a");
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("a.company", "company");
    expect(qb.getMany).toHaveBeenCalled();
    const calledDraftExclude = vi
      .mocked(qb.andWhere)
      .mock.calls.some(
        ([, params]) => params && typeof params === "object" && !Array.isArray(params) && "draftExclude" in params,
      );
    expect(calledDraftExclude).toBe(false);
  });

  it("findAllByUserId ACTIVE filter gates on latest-stage subquery", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", ApplicationQuickFilterEnum.Active);

    expect(qb.andWhere).toHaveBeenCalled();
    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ draftExclude: ApplicationStageEnum.Draft }),
    );
    expect(
      vi
        .mocked(qb.andWhere)
        .mock.calls.some(
          ([sql, bindings]) =>
            typeof sql === "string" &&
            bindings &&
            typeof bindings === "object" &&
            !Array.isArray(bindings) &&
            "excludeDraftLatestEvtActive" in bindings &&
            (bindings as { excludeDraftLatestEvtActive: unknown }).excludeDraftLatestEvtActive ===
              ApplicationStageEnum.Draft,
        ),
    ).toBe(true);
    expect(
      vi
        .mocked(qb.andWhere)
        .mock.calls.some(([sql]) => typeof sql === "string" && sql.includes("NOT IN") && sql.includes(":...stages")),
    ).toBe(true);
  });

  it("findAllByUserId APPLIED restricts latest stage filter", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", ApplicationQuickFilterEnum.Applied);

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "u1", stage: ApplicationStageEnum.Applied }),
    );
  });

  it("findAllByUserId DUPLICATED restricts latest stage filter", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", ApplicationQuickFilterEnum.Duplicated);

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "u1", stage: ApplicationStageEnum.Duplicated }),
    );
  });

  it("findAllByUserId REJECTED restricts latest stage filter", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", ApplicationQuickFilterEnum.Rejected);

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "u1", stage: ApplicationStageEnum.Rejected }),
    );
  });

  it("findAllByUserId INCOMING adds scheduled events EXISTS clause", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", ApplicationQuickFilterEnum.Incoming);

    expect(qb.andWhere).toHaveBeenCalled();
    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ draftExclude: ApplicationStageEnum.Draft }),
    );
    expect(
      vi
        .mocked(qb.andWhere)
        .mock.calls.some(
          ([sql, bindings]) =>
            typeof sql === "string" &&
            bindings &&
            typeof bindings === "object" &&
            !Array.isArray(bindings) &&
            "excludeDraftLatestEvtIncoming" in bindings &&
            (bindings as { excludeDraftLatestEvtIncoming: unknown }).excludeDraftLatestEvtIncoming ===
              ApplicationStageEnum.Draft,
        ),
    ).toBe(true);
    expect(
      vi.mocked(qb.andWhere).mock.calls.some(([frag]) => typeof frag === "string" && frag.includes("EXISTS")),
    ).toBe(true);
  });

  it("findAllByUserId NEW restricts on latest stage = NEW", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", ApplicationQuickFilterEnum.New);

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ draftExclude: ApplicationStageEnum.Draft }),
    );
    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "u1", stage: ApplicationStageEnum.New }),
    );
  });

  it("includes Draft quick filter after draft→jobs migration", () => {
    expect(ApplicationQuickFilterEnum.Draft).toBe("Draft");
  });

  it("includes Rejected quick filter for blocked-job discoverability", () => {
    expect(ApplicationQuickFilterEnum.Rejected).toBe("Rejected");
  });

  it("create saves row with scalar salary_* columns populated", async () => {
    vi.mocked(jobsRepo.create).mockImplementation((e) => e as JobEntity);
    const saved = { id: "j1", userId: "u1" } as JobEntity;
    vi.mocked(jobsRepo.save).mockResolvedValue(saved);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const dto = {
      title: "T",
      companyId: "c1",
      description: null,
      urls: [],
      source: null,
      salary: { minCents: 1_000_000, maxCents: 1_500_000, currency: "USD", period: null } as SalaryEmbedded,
      tags: [],
      location: null,
      workRegion: null,
      draftJobId: null,
    };

    await repo.create("u1", dto);

    expect(jobsRepo.create).toHaveBeenCalledTimes(1);
    const noDraftPayload = vi.mocked(jobsRepo.create).mock.calls[0]![0] as Record<string, unknown>;
    expect(noDraftPayload).not.toHaveProperty("id");
    expect(noDraftPayload).not.toHaveProperty("draftJobId");
    expect(jobsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        title: "T",
        companyId: "c1",
        description: null,
        location: null,
        workRegion: null,
        source: null,
        urls: [],
        tags: [],
        salary: { minCents: 1_000_000, maxCents: 1_500_000, currency: "USD", period: null },
        sourceRunId: null,
      }),
    );
    expect(jobsRepo.save).toHaveBeenCalledTimes(1);
  });

  it("create sets job id from trimmed draftJobId for draft conversion PK stability", async () => {
    vi.mocked(jobsRepo.create).mockImplementation((e) => e as JobEntity);
    const saved = { id: "draft-pk", userId: "u1" } as JobEntity;
    vi.mocked(jobsRepo.save).mockResolvedValue(saved);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const dto = {
      title: "T",
      companyId: "c1",
      description: null,
      urls: [],
      source: null,
      salary: { minCents: null, maxCents: null, currency: null, period: null } as SalaryEmbedded,
      tags: [],
      location: null,
      workRegion: null,
      draftJobId: "  draft-pk  ",
    };

    const result = await repo.create("u1", dto);

    expect(jobsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: "draft-pk", userId: "u1", companyId: "c1" }),
    );
    expect(vi.mocked(jobsRepo.create).mock.calls[0]![0] as Record<string, unknown>).not.toHaveProperty("draftJobId");
    expect(result).toBe(saved);
  });

  it("create ignores empty draftJobId string (generated id)", async () => {
    vi.mocked(jobsRepo.create).mockImplementation((e) => e as JobEntity);
    const saved = { id: "j1", userId: "u1" } as JobEntity;
    vi.mocked(jobsRepo.save).mockResolvedValue(saved);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await repo.create("u1", {
      title: "T",
      companyId: "c1",
      description: null,
      urls: [],
      source: null,
      salary: { minCents: null, maxCents: null, currency: null, period: null } as SalaryEmbedded,
      tags: [],
      location: null,
      workRegion: null,
      draftJobId: "   ",
    });

    const payload = vi.mocked(jobsRepo.create).mock.calls[0]![0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("id");
  });

  it("setPersistedStage updates jobs.stage scoped to id and userId", async () => {
    vi.mocked(jobsRepo.update).mockResolvedValue({ affected: 1 } as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await repo.setPersistedStage("u1", "j1", ApplicationStageEnum.Technical);

    expect(jobsRepo.update).toHaveBeenCalledWith({ id: "j1", userId: "u1" }, { stage: ApplicationStageEnum.Technical });
  });

  it("update merges dto into existing entity and saves", async () => {
    const existing = Object.assign(new JobEntity(), {
      id: "j1",
      userId: "u1",
      title: "Old",
      companyId: "c1",
      description: "{}",
      urls: [],
    });
    vi.mocked(jobsRepo.findOne).mockResolvedValue(existing);

    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbChain as never);

    vi.mocked(jobsRepo.findOne).mockResolvedValue({ ...existing, title: "New" });

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await repo.update("j1", "u1", { title: "New" });

    expect(qbChain.update).toHaveBeenCalled();
    expect(qbChain.set).toHaveBeenCalledWith(expect.objectContaining({ title: "New" }));
    expect(qbChain.where).toHaveBeenCalledWith("id = :id AND user_id = :userId", { id: "j1", userId: "u1" });
    expect(qbChain.execute).toHaveBeenCalled();
  });

  it("update returns null when job not owned", async () => {
    vi.mocked(jobsRepo.findOne).mockResolvedValue(null);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const result = await repo.update("missing", "u1", { title: "X" });

    expect(result).toBeNull();
    expect(jobsRepo.save).not.toHaveBeenCalled();
  });

  it("updateSummaryMetadataIfStatus updates when summary_status matches expected PROCESSING", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    vi.mocked(jobsRepo.manager.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const ok = await repo.updateSummaryMetadataIfStatus("j1", "u1", AsyncMetadataStatusEnum.Processing, {
      status: AsyncMetadataStatusEnum.Completed,
    });

    expect(ok).toBe(true);
    expect(qbChain.set).toHaveBeenCalledWith(expect.objectContaining({ summaryMetadata: expect.any(Object) }));
  });

  it("updateSummaryMetadataIfStatus uses IS NULL predicate when expecting null summary", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 0 }),
    };
    vi.mocked(jobsRepo.manager.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await repo.updateSummaryMetadataIfStatus("j1", "u1", null, { status: AsyncMetadataStatusEnum.Processing });

    expect(qbChain.andWhere).toHaveBeenCalledWith(`"summary_status" IS NULL`);
  });

  it("beginFillAutomaticallyProcessing sets PROCESSING when fill_status is restartable", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await expect(repo.beginFillAutomaticallyProcessing("j1", "u1")).resolves.toBe(true);

    expect(qbChain.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('("fill_status" IS NULL OR "fill_status" IN (:...restartableStatuses))'),
      expect.objectContaining({
        restartableStatuses: [AsyncMetadataStatusEnum.Failed, AsyncMetadataStatusEnum.Completed],
      }),
    );
    expect(qbChain.set).toHaveBeenCalledWith({
      fillMetadata: expect.objectContaining({ status: AsyncMetadataStatusEnum.Processing }),
    });
  });

  it("beginFillAutomaticallyProcessing returns false when status update affects no rows", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 0 }),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await expect(repo.beginFillAutomaticallyProcessing("j1", "u1")).resolves.toBe(false);
  });

  it("findUpToTwoJobPostingContextsByCompanyName trims and skips empty plaintext", async () => {
    const qb = makeMainJobsQb([]);
    qb.getMany.mockResolvedValue([
      Object.assign(new JobEntity(), {
        title: "",
        description: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [] }] }),
      }),
      Object.assign(new JobEntity(), {
        title: "Engineer",
        description: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Plain" }] }],
        }),
      }),
    ] as JobEntity[]);

    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    const rows = await listQuery.findUpToTwoJobPostingContextsByCompanyName("user-1", "Acme ");

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.stringContaining("stage"),
      expect.objectContaining({ excludeDraftPostingSnippet: ApplicationStageEnum.Draft }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ title: "Engineer", plainTextDescription: expect.stringContaining("Plain") });
  });

  it("delete removes row and returns previous entity snapshot", async () => {
    const existing = Object.assign(new JobEntity(), { id: "j1", userId: "u1", title: "T", companyId: "c" });
    vi.mocked(jobsRepo.findOne).mockResolvedValue(existing);
    vi.mocked(jobsRepo.delete).mockResolvedValue({ affected: 1 } as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const deleted = await repo.delete("j1", "u1");

    expect(jobsRepo.delete).toHaveBeenCalledWith({ id: "j1", userId: "u1" });
    expect(deleted?.id).toBe("j1");
  });

  it("detachJobsSourceRun zeroes matching source_run_id", async () => {
    vi.mocked(jobsRepo.update).mockResolvedValue({ affected: 3 } as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const affected = await repo.detachJobsSourceRun("run-x", "u1");

    expect(jobsRepo.update).toHaveBeenCalledWith({ userId: "u1", sourceRunId: "run-x" }, { sourceRunId: null });
    expect(affected).toBe(3);
  });

  it("resetStaleSummaryProcessing aggregates affected summaries", async () => {
    const qbStale = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 4 }),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbStale as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await expect(repo.resetStaleSummaryProcessing()).resolves.toBe(4);
  });

  it("resetStaleFillProcessing aggregates affected fill rows", async () => {
    const qbStale = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 2 }),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbStale as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await expect(repo.resetStaleFillProcessing()).resolves.toBe(2);
    expect(qbStale.where).toHaveBeenCalledWith(
      `"fill_status" = :processing`,
      expect.objectContaining({ processing: AsyncMetadataStatusEnum.Processing }),
    );
  });

  it("updateFillMetadataIfStatus succeeds when fill_status matches expected", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    vi.mocked(jobsRepo.manager.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const ok = await repo.updateFillMetadataIfStatus("j1", "u1", AsyncMetadataStatusEnum.Processing, {
      status: AsyncMetadataStatusEnum.Completed,
      timestamp: new Date(),
      error: null,
    });

    expect(ok).toBe(true);
    expect(qbChain.andWhere).toHaveBeenCalledWith(`"fill_status" = :expected`, {
      expected: AsyncMetadataStatusEnum.Processing,
    });
  });

  it("updateFillMetadataIfStatus returns false when status update affects no rows", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 0 }),
    };
    vi.mocked(jobsRepo.manager.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const ok = await repo.updateFillMetadataIfStatus("j1", "u1", AsyncMetadataStatusEnum.Processing, {
      status: AsyncMetadataStatusEnum.Failed,
      error: "x",
    });

    expect(ok).toBe(false);
  });

  it("updateFillMetadataIfStatus completes and fails fill metadata", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    vi.mocked(jobsRepo.manager.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await expect(
      repo.updateFillMetadataIfStatus("j1", "u1", AsyncMetadataStatusEnum.Processing, {
        status: AsyncMetadataStatusEnum.Completed,
        timestamp: new Date(),
        error: null,
      }),
    ).resolves.toBe(true);
    await expect(
      repo.updateFillMetadataIfStatus("j1", "u1", AsyncMetadataStatusEnum.Processing, {
        status: AsyncMetadataStatusEnum.Failed,
        error: "boom",
        timestamp: new Date(),
      }),
    ).resolves.toBe(true);
    expect(qbChain.execute).toHaveBeenCalledTimes(2);
  });

  it("findStageEventsByJobIdAndUserId orders by schedule and created timestamps", async () => {
    const qb = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(stageEventsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const stageEvents = new JobStageEventsRepository(stageEventsRepo as unknown as Repository<JobStageEventEntity>);

    const rows = await stageEvents.findStageEventsByJobIdAndUserId("job-1", "user-1");

    expect(stageEventsRepo.createQueryBuilder).toHaveBeenCalledWith("e");
    expect(qb.getMany).toHaveBeenCalled();
    expect(rows).toEqual([]);
  });

  it("findLatestStageSummariesByJobIds returns latest event per job (mock order matches SQL semantics)", async () => {
    // Production orders by COALESCE(schedule_at, created_at) DESC within each job_id
    // (after job_id ASC). Newest-first row for j1 must appear before older j1 rows.
    const j1Older = Object.assign(new JobStageEventEntity(), {
      id: "e1",
      jobId: "j1",
      userId: "u1",
      toStage: ApplicationStageEnum.Offer,
      reason: null,
      scheduledAt: null,
      createdAt: new Date("2026-01-01"),
    });
    const j1Newest = Object.assign(new JobStageEventEntity(), {
      id: "e2",
      jobId: "j1",
      userId: "u1",
      toStage: ApplicationStageEnum.New,
      reason: null,
      scheduledAt: null,
      createdAt: new Date("2026-01-03"),
    });
    const j2Only = Object.assign(new JobStageEventEntity(), {
      id: "e3",
      jobId: "j2",
      userId: "u1",
      toStage: ApplicationStageEnum.Applied,
      reason: null,
      scheduledAt: null,
      createdAt: new Date("2026-01-05"),
    });

    vi.mocked(stageEventsRepo.createQueryBuilder).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([j1Newest, j1Older, j2Only]),
    } as never);

    const stageEvents = new JobStageEventsRepository(stageEventsRepo as unknown as Repository<JobStageEventEntity>);

    const map = await stageEvents.findLatestStageSummariesByJobIds("u1", ["j1", "j2", "missing"]);

    expect(map.get("j1")?.toStage).toBe(ApplicationStageEnum.New);
    expect(map.get("j2")?.toStage).toBe(ApplicationStageEnum.Applied);
    expect(map.has("missing")).toBe(false);
  });

  it("create saves stage-event row owned by job", async () => {
    const saved = Object.assign(new JobStageEventEntity(), { id: "se-1", jobId: "j1", userId: "u1" });
    vi.mocked(stageEventsRepo.create).mockReturnValue(saved);
    vi.mocked(stageEventsRepo.save).mockResolvedValue(saved);

    const stageEvents = new JobStageEventsRepository(stageEventsRepo as unknown as Repository<JobStageEventEntity>);

    const created = await stageEvents.createStageEvent("u1", "j1", {
      toStage: ApplicationStageEnum.Technical,
      reason: null,
      scheduledAt: null,
      source: undefined,
      fromStage: ApplicationStageEnum.New,
    });

    expect(stageEventsRepo.create).toHaveBeenCalled();
    expect(stageEventsRepo.save).toHaveBeenCalledWith(expect.any(Object));
    expect(created.id).toBe("se-1");
  });

  it("findUpToTwoJobPostingContextsByCompanyName skips DB when trimmed name empty", async () => {
    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await expect(listQuery.findUpToTwoJobPostingContextsByCompanyName("user-1", "   ")).resolves.toEqual([]);
    expect(jobsRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it("findAllByUserId scopes company substring when requested", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", undefined, " MegaCorp ");

    expect(qb.andWhere).toHaveBeenCalledWith("LOWER(company.name) = LOWER(:company)", { company: "MegaCorp" });
  });

  it("findAllByUserId restricts by source run UUID when supplied", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const listQuery = new JobsListQuery(jobsRepo as unknown as Repository<JobEntity>);

    await listQuery.findAllByUserId("u1", undefined, undefined, "run-uuid");

    expect(qb.andWhere).toHaveBeenCalledWith("a.source_run_id = :runId", { runId: "run-uuid" });
  });

  it("findLatestStageEventByJobId uses COALESCE ordering matching summaries and filters", async () => {
    const ev = Object.assign(new JobStageEventEntity(), { id: "s1", jobId: "j1" });
    const qb = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(ev),
    };
    vi.mocked(stageEventsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const stageEvents = new JobStageEventsRepository(stageEventsRepo as unknown as Repository<JobStageEventEntity>);

    const latest = await stageEvents.findLatestStageEventByJobIdAndUserId("j1", "user-1");

    expect(stageEventsRepo.createQueryBuilder).toHaveBeenCalledWith("e");
    expect(qb.where).toHaveBeenCalledWith("e.job_id = :jobId AND e.user_id = :userId", {
      jobId: "j1",
      userId: "user-1",
    });
    expect(qb.orderBy).toHaveBeenCalledWith("COALESCE(e.schedule_at, e.created_at)", "DESC");
    expect(qb.addOrderBy).toHaveBeenCalledWith("e.created_at", "DESC");
    expect(qb.addOrderBy).toHaveBeenCalledWith("e.id", "DESC");
    expect(qb.limit).toHaveBeenCalledWith(1);
    expect(qb.getOne).toHaveBeenCalled();
    expect(latest?.id).toBe("s1");
  });

  it("delete returns null when job row missing before delete", async () => {
    vi.mocked(jobsRepo.findOne).mockResolvedValue(null);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    await expect(repo.delete("missing", "u1")).resolves.toBeNull();
    expect(jobsRepo.delete).not.toHaveBeenCalled();
  });

  it("updateSummary toggles textual summary TipTap blob", async () => {
    vi.mocked(jobsRepo.update).mockResolvedValue({ affected: 1 } as never);

    const repo = new JobsRepository(jobsRepo as unknown as Repository<JobEntity>);

    const ok = await repo.updateSummary("j1", '{"type":"doc"}', "user-1");
    expect(ok).toBe(true);
    expect(jobsRepo.update).toHaveBeenCalledWith({ id: "j1", userId: "user-1" }, { summary: '{"type":"doc"}' });
  });

  it("findStageEventByIdAndUserId filters by ownership", async () => {
    const ev = Object.assign(new JobStageEventEntity(), { id: "ev-1" });
    vi.mocked(stageEventsRepo.findOne).mockResolvedValue(ev);

    const stageEvents = new JobStageEventsRepository(stageEventsRepo as unknown as Repository<JobStageEventEntity>);

    const row = await stageEvents.findStageEventByIdAndUserId("ev-1", "user-1");
    expect(row?.id).toBe("ev-1");
  });

  it("updateStageEvent mutates fields and persists", async () => {
    const existing = Object.assign(new JobStageEventEntity(), {
      id: "ev-1",
      userId: "u1",
      toStage: ApplicationStageEnum.New,
      scheduledAt: null,
      reason: null,
    });
    vi.mocked(stageEventsRepo.findOne).mockResolvedValue(existing);
    vi.mocked(stageEventsRepo.save).mockImplementation((e) => Promise.resolve(e as JobStageEventEntity));

    const stageEvents = new JobStageEventsRepository(stageEventsRepo as unknown as Repository<JobStageEventEntity>);

    const updated = await stageEvents.updateStageEvent("ev-1", "u1", {
      toStage: ApplicationStageEnum.Offer,
      scheduledAt: new Date("2026-02-01"),
      reason: "Advance",
    });

    expect(updated?.toStage).toBe(ApplicationStageEnum.Offer);
    expect(updated?.reason).toBe("Advance");
  });

  it("deleteStageEvent signals boolean delete success", async () => {
    vi.mocked(stageEventsRepo.delete).mockResolvedValue({ affected: 1 } as never);

    const stageEvents = new JobStageEventsRepository(stageEventsRepo as unknown as Repository<JobStageEventEntity>);

    await expect(stageEvents.deleteStageEvent("ev-1", "u1")).resolves.toBe(true);
  });
});
