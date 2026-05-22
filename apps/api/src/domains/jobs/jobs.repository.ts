import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEvent, NewJobStageEvent } from "./job-stage-events.schema";
import { Job, NewJob } from "./jobs.schema";
import { StageEventSourceEnum } from "./stage-event-source.enum";

export type CreateJobRepoDto = Pick<
  NewJob,
  | "title"
  | "companyId"
  | "description"
  | "urls"
  | "source"
  | "salaryMinCents"
  | "salaryMaxCents"
  | "salaryCurrency"
  | "salaryPeriod"
  | "tags"
  | "location"
  | "workRegion"
> & {
  draftJobId?: string | null;
  sourceRunId?: string | null;
  htmlContent?: string | null;
};
export type UpdateJobRepoDto = Partial<CreateJobRepoDto>;

export type JobPostingContextSnippet = {
  title: string;
  plainTextDescription: string;
};
type CreateStageEventDto = {
  toStage: ApplicationStageEnum;
  source?: StageEventSourceEnum;
  fromStage?: ApplicationStageEnum | null;
  reason?: string | null;
  scheduledAt?: Date | null;
};
type UpdateStageEventDto = Pick<
  NewJobStageEvent,
  "toStage" | "reason" | "scheduledAt"
>;

@Injectable()
export class JobsRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepo: Repository<JobEntity>,
    @InjectRepository(JobStageEventEntity)
    private readonly stageEventsRepo: Repository<JobStageEventEntity>,
  ) {}

  /**
   * List jobs with optional quick filter. **Product / PRD:** when `filter` is omitted (the main "All" jobs
   * listing), results **include** `stage = DRAFT` captures alongside normal jobs - do not add a blanket
   * draft exclusion on this path. Explicit non-DRAFT quick filters exclude persisted drafts (`jobs.stage`),
   * then derive pipeline state via latest stage-event subqueries (same temporal ordering as batch helpers).
   * Call sites that need non-draft slices without matching an {@link ApplicationQuickFilterEnum} value must use
   * a bespoke query or a dedicated repo helper instead of repurposing undefined `filter` semantics.
   */
  async findAllByUserId(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
    company?: string,
    runId?: string,
  ): Promise<Job[]> {
    const qb = this.jobsRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.company", "company")
      .where("a.user_id = :userId", { userId });

    const latestTimestampSubQuery = qb
      .subQuery()
      .select("COALESCE(e.schedule_at, e.created_at)")
      .from(JobStageEventEntity, "e")
      .where("e.job_id = a.id")
      .andWhere("e.user_id = :userId")
      .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .limit(1)
      .getQuery();

    qb.orderBy(`(${latestTimestampSubQuery})`, "DESC", "NULLS LAST");

    const normalizedCompany = company?.trim();
    if (normalizedCompany) {
      qb.andWhere("LOWER(company.name) = LOWER(:company)", {
        company: normalizedCompany,
      });
    }

    const normalizedRunId = runId?.trim();
    if (normalizedRunId) {
      qb.andWhere("a.source_run_id = :runId", { runId: normalizedRunId });
    }

    if (!filter) {
      return qb.getMany();
    }

    if (filter === ApplicationQuickFilterEnum.DRAFT) {
      qb.andWhere("a.stage = :draftStage", {
        draftStage: ApplicationStageEnum.DRAFT,
      });
      return qb.getMany();
    }

    /** Non-DRAFT quick filters derive state from stage events — still exclude persisted DRAFT rows. */
    qb.andWhere("a.stage != :draftExclude", {
      draftExclude: ApplicationStageEnum.DRAFT,
    });

    const latestStageSub = `(${qb
      .subQuery()
      .select("e.to_stage")
      .from(JobStageEventEntity, "e")
      .where("e.job_id = a.id")
      .andWhere("e.user_id = :userId")
      .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .limit(1)
      .getQuery()})`;

    if (filter === ApplicationQuickFilterEnum.NEW) {
      qb.andWhere(`${latestStageSub} = :stage`, {
        userId,
        stage: ApplicationStageEnum.NEW,
      });
    } else if (filter === ApplicationQuickFilterEnum.DUPLICATED) {
      qb.andWhere(`${latestStageSub} = :stage`, {
        userId,
        stage: ApplicationStageEnum.DUPLICATED,
      });
    } else if (filter === ApplicationQuickFilterEnum.APPLIED) {
      qb.andWhere(`${latestStageSub} = :stage`, {
        userId,
        stage: ApplicationStageEnum.APPLIED,
      });
    } else if (filter === ApplicationQuickFilterEnum.ACTIVE) {
      // Defensive: never treat latest event DRAFT as "active pipeline" even if row metadata drifts.
      qb.andWhere(`${latestStageSub} NOT IN (:...stages)`, {
        userId,
        stages: [
          ApplicationStageEnum.NEW,
          ApplicationStageEnum.APPLIED,
          ApplicationStageEnum.REJECTED,
          ApplicationStageEnum.DUPLICATED,
        ],
      }).andWhere(`${latestStageSub} != :excludeDraftLatestEvtActive`, {
        userId,
        excludeDraftLatestEvtActive: ApplicationStageEnum.DRAFT,
      });
    } else if (filter === ApplicationQuickFilterEnum.INCOMING) {
      qb.andWhere(`${latestStageSub} NOT IN (:...stages)`, {
        userId,
        stages: [
          ApplicationStageEnum.APPLIED,
          ApplicationStageEnum.REJECTED,
          ApplicationStageEnum.DUPLICATED,
        ],
      })
        .andWhere(`${latestStageSub} != :excludeDraftLatestEvtIncoming`, {
          userId,
          excludeDraftLatestEvtIncoming: ApplicationStageEnum.DRAFT,
        })
        .andWhere(
          `EXISTS ${qb
            .subQuery()
            .select("1")
            .from(JobStageEventEntity, "e")
            .where("e.job_id = a.id")
            .andWhere("e.user_id = :userId")
            .andWhere("e.schedule_at >= :today")
            .getQuery()}`,
          { userId, today: new Date(new Date().setHours(0, 0, 0, 0)) },
        );
    }

    return qb.getMany();
  }

  /**
   * Up to two recent jobs for this user whose company matches (case-insensitive, trimmed),
   * with non-empty plaintext extracted from TipTap descriptions. Draft captures excluded so snippets
   * do not bleed placeholder-draft rows into AI/context paths.
   */
  async findUpToTwoJobPostingContextsByCompanyName(
    userId: string,
    companyName: string,
  ): Promise<JobPostingContextSnippet[]> {
    const normalized = companyName.trim();
    if (!normalized) {
      return [];
    }

    const rows = await this.jobsRepo
      .createQueryBuilder("a")
      .innerJoin("a.company", "c")
      .where("a.user_id = :userId", { userId })
      .andWhere("a.stage != :excludeDraftPostingSnippet", {
        excludeDraftPostingSnippet: ApplicationStageEnum.DRAFT,
      })
      .andWhere("LOWER(TRIM(c.name)) = LOWER(TRIM(:company))", {
        company: normalized,
      })
      .andWhere("a.description IS NOT NULL")
      .orderBy("a.updatedAt", "DESC")
      .take(25)
      .getMany();

    const contexts: JobPostingContextSnippet[] = [];
    for (const row of rows) {
      const plain = tipTapToPlainText(row.description);
      if (!plain.trim()) {
        continue;
      }
      const trimmedTitle = row.title?.trim() ?? "";
      const title = trimmedTitle.length > 0 ? trimmedTitle : "(no title)";
      contexts.push({ title, plainTextDescription: plain });
      if (contexts.length >= 2) {
        break;
      }
    }

    return contexts;
  }

  /**
   * Another job (same user, same company, same trimmed title, case-insensitive)
   * created on or after `referenceTime - lookbackMs`.
   */
  async hasRecentDuplicateSameRoleAndCompany(
    userId: string,
    excludeJobId: string,
    companyId: string,
    title: string,
    referenceTime: Date,
    lookbackMs: number,
  ): Promise<boolean> {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return false;
    }
    const cutoff = new Date(referenceTime.getTime() - lookbackMs);
    const count = await this.jobsRepo
      .createQueryBuilder("a")
      .where("a.user_id = :userId", { userId })
      .andWhere("a.id != :excludeJobId", { excludeJobId })
      .andWhere("a.company_id = :companyId", { companyId })
      .andWhere("LOWER(TRIM(a.title)) = LOWER(:titleNorm)", {
        titleNorm: trimmedTitle,
      })
      .andWhere("a.created_at >= :cutoff", { cutoff })
      .getCount();
    return count > 0;
  }

  async findOneByIdAndUserId(id: string, userId: string): Promise<Job | null> {
    return this.jobsRepo.findOne({
      where: { id, userId },
      relations: ["company"],
    });
  }

  /**
   * Keep denormalized `jobs.stage` aligned with the canonical initial pipeline stage (before/for the
   * first system stage event). Required when converting a DRAFT row via `create` + reused PK: plain
   * `save()` would leave stale `stage = DRAFT` despite `NEW`/`DUPLICATED` events.
   */
  async setPersistedStage(
    userId: string,
    jobId: string,
    stage: ApplicationStageEnum,
  ): Promise<void> {
    await this.jobsRepo.update({ id: jobId, userId }, { stage });
  }

  async create(userId: string, dto: CreateJobRepoDto): Promise<Job> {
    const { draftJobId, sourceRunId, ...rest } = dto;
    const draftPk =
      typeof draftJobId === "string" && draftJobId.trim().length > 0
        ? draftJobId.trim()
        : null;
    const row = this.jobsRepo.create({
      userId,
      ...rest,
      sourceRunId: sourceRunId ?? null,
      ...(draftPk ? { id: draftPk } : {}),
    });
    return this.jobsRepo.save(row);
  }

  async detachJobsSourceRun(
    sourceRunId: string,
    userId: string,
  ): Promise<number> {
    const result = await this.jobsRepo.update(
      { userId, sourceRunId },
      { sourceRunId: null },
    );
    return result.affected ?? 0;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateJobRepoDto,
  ): Promise<Job | null> {
    const existing = await this.findOneByIdAndUserId(id, userId);
    if (!existing) {
      return null;
    }
    Object.assign(existing, dto);
    return this.jobsRepo.save(existing);
  }

  async delete(id: string, userId: string): Promise<Job | null> {
    const existing = await this.findOneByIdAndUserId(id, userId);
    if (!existing) {
      return null;
    }
    await this.jobsRepo.delete({ id, userId });
    return existing;
  }

  async findStageEventsByJobIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<JobStageEvent[]> {
    return this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.job_id = :jobId AND e.user_id = :userId", { jobId, userId })
      .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .getMany();
  }

  async findLatestStageEventByJobIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<JobStageEvent | null> {
    return this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.job_id = :jobId AND e.user_id = :userId", { jobId, userId })
      .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .limit(1)
      .getOne();
  }

  /**
   * Latest event per job (order: COALESCE(schedule_at, created_at) desc),
   * one round-trip. Used to expose current stage on `Job` without N+1.
   */
  async findLatestStageSummariesByJobIds(
    userId: string,
    jobIds: string[],
  ): Promise<
    Map<
      string,
      {
        toStage: NewJobStageEvent["toStage"];
        reason: string | null;
        statusAt: Date;
      }
    >
  > {
    const result = new Map<
      string,
      {
        toStage: NewJobStageEvent["toStage"];
        reason: string | null;
        statusAt: Date;
      }
    >();
    if (jobIds.length === 0) {
      return result;
    }
    const events = await this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.user_id = :userId", { userId })
      .andWhere("e.job_id IN (:...ids)", { ids: jobIds })
      .orderBy("e.job_id", "ASC")
      .addOrderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .getMany();

    for (const ev of events) {
      if (result.has(ev.jobId)) {
        continue;
      }
      result.set(ev.jobId, {
        toStage: ev.toStage,
        reason: ev.reason,
        statusAt: ev.scheduledAt ?? ev.createdAt,
      });
    }
    return result;
  }

  async findStageEventByIdAndUserId(
    stageEventId: string,
    userId: string,
  ): Promise<JobStageEvent | null> {
    return this.stageEventsRepo.findOne({
      where: { id: stageEventId, userId },
    });
  }

  async createStageEvent(
    userId: string,
    jobId: string,
    dto: CreateStageEventDto,
  ): Promise<JobStageEvent> {
    const row = this.stageEventsRepo.create({
      userId,
      jobId,
      fromStage: dto.fromStage ?? null,
      toStage: dto.toStage,
      source: dto.source ?? StageEventSourceEnum.Manual,
      reason: dto.reason ?? null,
      scheduledAt: dto.scheduledAt ?? null,
    });
    return this.stageEventsRepo.save(row);
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: Partial<UpdateStageEventDto>,
  ): Promise<JobStageEvent | null> {
    const existing = await this.stageEventsRepo.findOne({
      where: { id: stageEventId, userId },
    });
    if (!existing) {
      return null;
    }
    if (dto.toStage !== undefined) {
      existing.toStage = dto.toStage;
    }
    if (dto.scheduledAt !== undefined) {
      existing.scheduledAt = dto.scheduledAt;
    }
    if (dto.reason !== undefined) {
      existing.reason = dto.reason;
    }
    return this.stageEventsRepo.save(existing);
  }

  async deleteStageEvent(
    stageEventId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.stageEventsRepo.delete({
      id: stageEventId,
      userId,
    });
    return (result.affected ?? 0) > 0;
  }

  async updateSummaryMetadata(
    jobId: string,
    expectedStatus: Pick<AsyncMetadataEmbedded, "status"> | null,
    patch: Partial<AsyncMetadataEmbedded> & {
      status: AsyncMetadataEmbedded["status"];
    },
    userId: string,
  ): Promise<boolean> {
    const summaryUpdate: Partial<AsyncMetadataEmbedded> = {
      status: patch.status,
    };
    if (patch.error !== undefined) {
      summaryUpdate.error = patch.error;
    }
    if (patch.timestamp !== undefined) {
      summaryUpdate.timestamp = patch.timestamp;
    }

    const qb = this.jobsRepo
      .createQueryBuilder()
      .update(JobEntity)
      .set({ summaryMetadata: summaryUpdate })
      .where(`"id" = :id AND "user_id" = :userId`, { id: jobId, userId });

    if (expectedStatus === null) {
      qb.andWhere(`"summary_status" IS NULL`);
    } else {
      qb.andWhere(`"summary_status" = :expected`, {
        expected: expectedStatus.status,
      });
    }

    const result = await qb.execute();
    return (result.affected ?? 0) > 0;
  }

  async updateSummary(
    jobId: string,
    summary: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.jobsRepo.update(
      { id: jobId, userId },
      { summary },
    );
    return (result.affected ?? 0) > 0;
  }

  async resetStaleSummaryProcessing(): Promise<number> {
    const result = await this.jobsRepo
      .createQueryBuilder()
      .update()
      .set({
        summaryMetadata: {
          status: AsyncMetadataStatusEnum.FAILED,
          error: "Server restart",
        },
      })
      .where(`"summary_status" = :processing`, {
        processing: AsyncMetadataStatusEnum.PROCESSING,
      })
      .execute();
    return result.affected ?? 0;
  }

  /**
   * Sets fill pipeline metadata on a job owned by {@param userId}
   * (same column pattern as {@link updateSummaryMetadata}).
   */
  async updateFillMetadata(
    jobId: string,
    expectedStatus: Pick<AsyncMetadataEmbedded, "status"> | null,
    patch: Partial<AsyncMetadataEmbedded> & {
      status: AsyncMetadataEmbedded["status"];
    },
    userId: string,
  ): Promise<boolean> {
    const fillUpdate: Partial<AsyncMetadataEmbedded> = { status: patch.status };
    if (patch.error !== undefined) {
      fillUpdate.error = patch.error;
    }
    if (patch.timestamp !== undefined) {
      fillUpdate.timestamp = patch.timestamp;
    }

    const qb = this.jobsRepo
      .createQueryBuilder()
      .update(JobEntity)
      .set({ fillMetadata: fillUpdate })
      .where(`"id" = :id AND "user_id" = :userId`, { id: jobId, userId });

    if (expectedStatus === null) {
      qb.andWhere(`"fill_status" IS NULL`);
    } else {
      qb.andWhere(`"fill_status" = :expected`, {
        expected: expectedStatus.status,
      });
    }

    const result = await qb.execute();
    return (result.affected ?? 0) > 0;
  }
}
