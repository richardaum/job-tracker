import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobsRepository } from "./jobs.repository";
import type { Job } from "./jobs.schema";

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
    | "findOne"
    | "create"
    | "save"
    | "update"
    | "delete"
    | "createQueryBuilder"
    | "find"
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

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const result = await repo.findOneByIdAndUserId("j1", "u1");

    expect(jobsRepo.findOne).toHaveBeenCalledWith({
      where: { id: "j1", userId: "u1" },
      relations: ["company"],
    });
    expect(result).toBe(row);
  });

  it("findAllByUserId without filter calls getMany on ordered query", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1");

    expect(jobsRepo.createQueryBuilder).toHaveBeenCalledWith("a");
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("a.company", "company");
    expect(qb.getMany).toHaveBeenCalled();
  });

  it("findAllByUserId ACTIVE filter gates on latest-stage subquery", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1", ApplicationQuickFilterEnum.ACTIVE);

    expect(qb.andWhere).toHaveBeenCalled();
    expect(
      vi
        .mocked(qb.andWhere)
        .mock.calls.some(
          ([sql]) =>
            typeof sql === "string" &&
            sql.includes("NOT IN") &&
            sql.includes(":...stages"),
        ),
    ).toBe(true);
  });

  it("findAllByUserId APPLIED restricts latest stage filter", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1", ApplicationQuickFilterEnum.APPLIED);

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userId: "u1",
        stage: ApplicationStageEnum.APPLIED,
      }),
    );
  });

  it("findAllByUserId DUPLICATED restricts latest stage filter", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1", ApplicationQuickFilterEnum.DUPLICATED);

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userId: "u1",
        stage: ApplicationStageEnum.DUPLICATED,
      }),
    );
  });

  it("findAllByUserId INCOMING adds scheduled events EXISTS clause", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1", ApplicationQuickFilterEnum.INCOMING);

    expect(qb.andWhere).toHaveBeenCalled();
    expect(
      vi
        .mocked(qb.andWhere)
        .mock.calls.some(
          ([frag]) => typeof frag === "string" && frag.includes("EXISTS"),
        ),
    ).toBe(true);
  });

  it("findAllByUserId NEW restricts on latest stage = NEW", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1", ApplicationQuickFilterEnum.NEW);

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userId: "u1",
        stage: ApplicationStageEnum.NEW,
      }),
    );
  });

  it("includes DRAFT quick filter after draft→jobs migration", () => {
    expect(ApplicationQuickFilterEnum.DRAFT).toBe("DRAFT");
  });

  it("create saves row with scalar salary_* columns populated", async () => {
    vi.mocked(jobsRepo.create).mockImplementation((e) => e as JobEntity);
    const saved = { id: "j1", userId: "u1" } as JobEntity;
    vi.mocked(jobsRepo.save).mockResolvedValue(saved);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const dto = {
      title: "T",
      companyId: "c1",
      description: null,
      urls: [],
      source: null,
      salaryMinCents: 1_000_000,
      salaryMaxCents: 1_500_000,
      salaryCurrency: "USD",
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
      draftJobId: null,
    };

    await repo.create("u1", dto);

    expect(jobsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        title: "T",
        companyId: "c1",
        salaryMinCents: 1_000_000,
        salaryMaxCents: 1_500_000,
        salaryCurrency: "USD",
        sourceRunId: null,
      }),
    );
    expect(jobsRepo.save).toHaveBeenCalledTimes(1);
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
    vi.mocked(jobsRepo.save).mockResolvedValue(existing);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.update("j1", "u1", { title: "New" });

    expect(existing.title).toBe("New");
    expect(jobsRepo.save).toHaveBeenCalledWith(existing);
  });

  it("update returns null when job not owned", async () => {
    vi.mocked(jobsRepo.findOne).mockResolvedValue(null);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const result = await repo.update("missing", "u1", { title: "X" });

    expect(result).toBeNull();
    expect(jobsRepo.save).not.toHaveBeenCalled();
  });

  it("updateSummaryMetadata updates when summary_status matches expected PROCESSING", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const ok = await repo.updateSummaryMetadata(
      "j1",
      { status: AsyncMetadataStatusEnum.PROCESSING },
      { status: AsyncMetadataStatusEnum.COMPLETED },
      "u1",
    );

    expect(ok).toBe(true);
    expect(qbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ summaryMetadata: expect.any(Object) }),
    );
  });

  it("updateSummaryMetadata uses IS NULL predicate when expecting null summary", async () => {
    const qbChain = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 0 }),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbChain as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.updateSummaryMetadata(
      "j1",
      null,
      { status: AsyncMetadataStatusEnum.PROCESSING },
      "u1",
    );

    expect(qbChain.andWhere).toHaveBeenCalledWith(`"summary_status" IS NULL`);
  });

  it("findUpToTwoJobPostingContextsByCompanyName trims and skips empty plaintext", async () => {
    const qb = makeMainJobsQb([]);
    qb.getMany.mockResolvedValue([
      Object.assign(new JobEntity(), {
        title: "",
        description: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph", content: [] }],
        }),
      }),
      Object.assign(new JobEntity(), {
        title: "Engineer",
        description: JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Plain" }] },
          ],
        }),
      }),
    ] as JobEntity[]);

    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const rows = await repo.findUpToTwoJobPostingContextsByCompanyName(
      "user-1",
      "Acme ",
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: "Engineer",
      plainTextDescription: expect.stringContaining("Plain"),
    });
  });

  it("hasRecentDuplicateSameRoleAndCompany returns false when title blank", async () => {
    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const hit = await repo.hasRecentDuplicateSameRoleAndCompany(
      "u1",
      "j1",
      "c1",
      "   ",
      new Date(),
      86400000,
    );

    expect(hit).toBe(false);
    expect(jobsRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it("delete removes row and returns previous entity snapshot", async () => {
    const existing = Object.assign(new JobEntity(), {
      id: "j1",
      userId: "u1",
      title: "T",
      companyId: "c",
    });
    vi.mocked(jobsRepo.findOne).mockResolvedValue(existing);
    vi.mocked(jobsRepo.delete).mockResolvedValue({ affected: 1 } as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const deleted = await repo.delete("j1", "u1");

    expect(jobsRepo.delete).toHaveBeenCalledWith({ id: "j1", userId: "u1" });
    expect(deleted?.id).toBe("j1");
  });

  it("detachJobsSourceRun zeroes matching source_run_id", async () => {
    vi.mocked(jobsRepo.update).mockResolvedValue({ affected: 3 } as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const affected = await repo.detachJobsSourceRun("run-x", "u1");

    expect(jobsRepo.update).toHaveBeenCalledWith(
      { userId: "u1", sourceRunId: "run-x" },
      { sourceRunId: null },
    );
    expect(affected).toBe(3);
  });

  it("findDraftJobId returns null after draft FK removal", async () => {
    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await expect(repo.findDraftJobId("job-x", "u1")).resolves.toBeNull();
    expect(jobsRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it("resetStaleSummaryProcessing aggregates affected summaries", async () => {
    const qbStale = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ affected: 4 }),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qbStale as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await expect(repo.resetStaleSummaryProcessing()).resolves.toBe(4);
  });

  it("findStageEventsByJobIdAndUserId orders by schedule and created timestamps", async () => {
    const qb = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(stageEventsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const rows = await repo.findStageEventsByJobIdAndUserId("job-1", "user-1");

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
      toStage: ApplicationStageEnum.OFFER,
      reason: null,
      scheduledAt: null,
      createdAt: new Date("2026-01-01"),
    });
    const j1Newest = Object.assign(new JobStageEventEntity(), {
      id: "e2",
      jobId: "j1",
      userId: "u1",
      toStage: ApplicationStageEnum.NEW,
      reason: null,
      scheduledAt: null,
      createdAt: new Date("2026-01-03"),
    });
    const j2Only = Object.assign(new JobStageEventEntity(), {
      id: "e3",
      jobId: "j2",
      userId: "u1",
      toStage: ApplicationStageEnum.APPLIED,
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

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const map = await repo.findLatestStageSummariesByJobIds("u1", [
      "j1",
      "j2",
      "missing",
    ]);

    expect(map.get("j1")?.toStage).toBe(ApplicationStageEnum.NEW);
    expect(map.get("j2")?.toStage).toBe(ApplicationStageEnum.APPLIED);
    expect(map.has("missing")).toBe(false);
  });

  it("create saves stage-event row owned by job", async () => {
    const saved = Object.assign(new JobStageEventEntity(), {
      id: "se-1",
      jobId: "j1",
      userId: "u1",
    });
    vi.mocked(stageEventsRepo.create).mockReturnValue(saved);
    vi.mocked(stageEventsRepo.save).mockResolvedValue(saved);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const created = await repo.createStageEvent("u1", "j1", {
      toStage: ApplicationStageEnum.TECHNICAL,
      reason: null,
      scheduledAt: null,
      source: undefined,
      fromStage: ApplicationStageEnum.NEW,
    });

    expect(stageEventsRepo.create).toHaveBeenCalled();
    expect(stageEventsRepo.save).toHaveBeenCalledWith(expect.any(Object));
    expect(created.id).toBe("se-1");
  });

  it("findUpToTwoJobPostingContextsByCompanyName skips DB when trimmed name empty", async () => {
    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await expect(
      repo.findUpToTwoJobPostingContextsByCompanyName("user-1", "   "),
    ).resolves.toEqual([]);
    expect(jobsRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it("findAllByUserId scopes company substring when requested", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1", undefined, " MegaCorp ");

    expect(qb.andWhere).toHaveBeenCalledWith(
      "LOWER(company.name) = LOWER(:company)",
      { company: "MegaCorp" },
    );
  });

  it("findAllByUserId restricts by source run UUID when supplied", async () => {
    const qb = makeMainJobsQb([]);
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await repo.findAllByUserId("u1", undefined, undefined, "run-uuid");

    expect(qb.andWhere).toHaveBeenCalledWith("a.source_run_id = :runId", {
      runId: "run-uuid",
    });
  });

  it("hasRecentDuplicateSameRoleAndCompany returns true when lookback yields matches", async () => {
    const qb = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getCount: vi.fn().mockResolvedValue(2),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const hit = await repo.hasRecentDuplicateSameRoleAndCompany(
      "user-1",
      "exclude",
      "comp",
      "Title",
      new Date(),
      1,
    );

    expect(hit).toBe(true);
    expect(qb.getCount).toHaveBeenCalled();
  });

  it("findLatestStageEventByJobId delegates to descending findOne ordering", async () => {
    const ev = Object.assign(new JobStageEventEntity(), {
      id: "s1",
      jobId: "j1",
    });
    vi.mocked(stageEventsRepo.findOne).mockResolvedValue(ev);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const latest = await repo.findLatestStageEventByJobIdAndUserId(
      "j1",
      "user-1",
    );

    expect(stageEventsRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobId: "j1", userId: "user-1" },
        order: { createdAt: "DESC", id: "DESC" },
      }),
    );
    expect(latest?.id).toBe("s1");
  });

  it("delete returns null when job row missing before delete", async () => {
    vi.mocked(jobsRepo.findOne).mockResolvedValue(null);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await expect(repo.delete("missing", "u1")).resolves.toBeNull();
    expect(jobsRepo.delete).not.toHaveBeenCalled();
  });

  it("updateSummary toggles textual summary TipTap blob", async () => {
    vi.mocked(jobsRepo.update).mockResolvedValue({ affected: 1 } as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const ok = await repo.updateSummary("j1", '{"type":"doc"}', "user-1");
    expect(ok).toBe(true);
    expect(jobsRepo.update).toHaveBeenCalledWith(
      { id: "j1", userId: "user-1" },
      { summary: '{"type":"doc"}' },
    );
  });

  it("findStageEventByIdAndUserId filters by ownership", async () => {
    const ev = Object.assign(new JobStageEventEntity(), { id: "ev-1" });
    vi.mocked(stageEventsRepo.findOne).mockResolvedValue(ev);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const row = await repo.findStageEventByIdAndUserId("ev-1", "user-1");
    expect(row?.id).toBe("ev-1");
  });

  it("updateStageEvent mutates fields and persists", async () => {
    const existing = Object.assign(new JobStageEventEntity(), {
      id: "ev-1",
      userId: "u1",
      toStage: ApplicationStageEnum.NEW,
      scheduledAt: null,
      reason: null,
    });
    vi.mocked(stageEventsRepo.findOne).mockResolvedValue(existing);
    vi.mocked(stageEventsRepo.save).mockImplementation((e) =>
      Promise.resolve(e as JobStageEventEntity),
    );

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    const updated = await repo.updateStageEvent("ev-1", "u1", {
      toStage: ApplicationStageEnum.OFFER,
      scheduledAt: new Date("2026-02-01"),
      reason: "Advance",
    });

    expect(updated?.toStage).toBe(ApplicationStageEnum.OFFER);
    expect(updated?.reason).toBe("Advance");
  });

  it("deleteStageEvent signals boolean delete success", async () => {
    vi.mocked(stageEventsRepo.delete).mockResolvedValue({
      affected: 1,
    } as never);

    const repo = new JobsRepository(
      jobsRepo as unknown as Repository<JobEntity>,
      stageEventsRepo as unknown as Repository<JobStageEventEntity>,
    );

    await expect(repo.deleteStageEvent("ev-1", "u1")).resolves.toBe(true);
  });
});
