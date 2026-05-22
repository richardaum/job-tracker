import type { ConversionMetadataEmbedded } from "@api/database/embeddeds/conversion-metadata.embedded";
import { DraftJobConversionStatusEnum } from "@api/database/entities/draft-job-conversion.enum";
import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { CompanyRepository } from "@api/domains/companies/companies.repository";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import { StageEventSourceEnum } from "@api/domains/jobs/stage-event-source.enum";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { DRAFT_JOB_PLACEHOLDER_COMPANY_NAME } from "./draft-placeholder.constants";

/**
 * Persisted drafts are `jobs` rows with `stage = DRAFT` (no separate `DraftJobEntity` /
 * `draft_jobs` TypeORM mapping after the merge migration).
 */
export type DraftJobRow = {
  id: string;
  url: string | null;
  title: string;
  htmlContent: string;
  userId: string;
  conversionMetadata?: ConversionMetadataEmbedded | null;
  createdAt: Date;
  updatedAt: Date;
};

function conversionStatusToAsync(
  status: DraftJobConversionStatusEnum | null | undefined,
): AsyncMetadataStatusEnum | null {
  switch (status) {
    case DraftJobConversionStatusEnum.PROCESSING:
      return AsyncMetadataStatusEnum.PROCESSING;
    case DraftJobConversionStatusEnum.SUCCEEDED:
      return AsyncMetadataStatusEnum.COMPLETED;
    case DraftJobConversionStatusEnum.FAILED:
      return AsyncMetadataStatusEnum.FAILED;
    default:
      return null;
  }
}

/** Maps DB fill_* columns to semantic conversion status used by Draft GraphQL/types. */
function jobFillToConversion(
  job: JobEntity,
): ConversionMetadataEmbedded | null {
  const fill = job.fillMetadata;
  if (!fill?.status && fill?.error == null && fill?.timestamp == null) {
    return {
      status: DraftJobConversionStatusEnum.IDLE,
      error: null,
      timestamp: null,
    };
  }

  let status: DraftJobConversionStatusEnum = DraftJobConversionStatusEnum.IDLE;
  if (fill!.status === AsyncMetadataStatusEnum.PROCESSING) {
    status = DraftJobConversionStatusEnum.PROCESSING;
  } else if (fill!.status === AsyncMetadataStatusEnum.COMPLETED) {
    status = DraftJobConversionStatusEnum.SUCCEEDED;
  } else if (fill!.status === AsyncMetadataStatusEnum.FAILED) {
    status = DraftJobConversionStatusEnum.FAILED;
  }

  return {
    status,
    error: fill!.error ?? null,
    timestamp: fill!.timestamp ?? null,
  };
}

/** Status implied by persisted fill_* columns (NULL fill_status ⇒ legacy "expected null" semantics). */
function storedConversionBucket(
  job: JobEntity,
): DraftJobConversionStatusEnum | "__empty__" {
  const s = job.fillMetadata?.status;
  if (
    !s &&
    job.fillMetadata?.error == null &&
    job.fillMetadata?.timestamp == null
  ) {
    return "__empty__";
  }
  if (!s) {
    return DraftJobConversionStatusEnum.IDLE;
  }
  if (s === AsyncMetadataStatusEnum.PROCESSING) {
    return DraftJobConversionStatusEnum.PROCESSING;
  }
  if (s === AsyncMetadataStatusEnum.COMPLETED) {
    return DraftJobConversionStatusEnum.SUCCEEDED;
  }
  if (s === AsyncMetadataStatusEnum.FAILED) {
    return DraftJobConversionStatusEnum.FAILED;
  }
  return DraftJobConversionStatusEnum.IDLE;
}

export function draftJobRowFromJobEntity(job: JobEntity): DraftJobRow {
  const urls = job.urls ?? [];
  return {
    id: job.id,
    url: urls.length > 0 && urls[0]!.trim() !== "" ? urls[0]!.trim() : null,
    title: job.title?.trim() ? job.title : "",
    htmlContent: job.htmlContent ?? "",
    userId: job.userId,
    conversionMetadata: jobFillToConversion(job),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

@Injectable()
export class DraftJobsRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepo: Repository<JobEntity>,
    @InjectRepository(JobStageEventEntity)
    private readonly stageEventsRepo: Repository<JobStageEventEntity>,
    private readonly companyRepo: CompanyRepository,
  ) {}

  async findAll(userId: string): Promise<DraftJobRow[]> {
    const rows = await this.jobsRepo.find({
      where: { userId, stage: ApplicationStageEnum.DRAFT },
      order: { updatedAt: "DESC" },
    });
    return rows.map(draftJobRowFromJobEntity);
  }

  async findOne(id: string, userId: string): Promise<DraftJobRow | null> {
    const row = await this.jobsRepo.findOne({
      where: { id, userId, stage: ApplicationStageEnum.DRAFT },
    });
    return row ? draftJobRowFromJobEntity(row) : null;
  }

  /**
   * Returns the canonical `jobs.id` backing this draft capture (same UUID as legacy `draft_jobs.id`).
   */
  async findLatestJobIdByDraftId(draftId: string): Promise<string | null> {
    const row = await this.jobsRepo.findOne({
      where: { id: draftId, stage: ApplicationStageEnum.DRAFT },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  /**
   * Legacy hook from when creating a preview job keyed by draft FK. No sibling rows remain after merge.
   */
  async deleteJobsByDraftId(_draftId: string, _userId: string): Promise<void> {
    await Promise.resolve();
  }

  async create(params: {
    url: string | null;
    title: string;
    htmlContent: string;
    userId: string;
  }): Promise<DraftJobRow> {
    const company = await this.companyRepo.findOrCreateByName(
      params.userId,
      DRAFT_JOB_PLACEHOLDER_COMPANY_NAME,
    );

    const urls =
      params.url !== null && params.url.trim() !== ""
        ? [params.url.trim()]
        : [];

    const row = this.jobsRepo.create({
      userId: params.userId,
      companyId: company.id,
      title: params.title,
      htmlContent: params.htmlContent,
      urls,
      stage: ApplicationStageEnum.DRAFT,
      description: null,
      source: null,
      salaryMinCents: null,
      salaryMaxCents: null,
      salaryCurrency: null,
      salaryPeriod: null,
      tags: [],
      location: null,
      workRegion: null,
      summary: null,
      sourceRunId: null,
      fillMetadata: { status: null, error: null, timestamp: null },
      summaryMetadata: { status: null, error: null, timestamp: null },
    });

    const saved = await this.jobsRepo.save(row);
    const evt = this.stageEventsRepo.create({
      jobId: saved.id,
      userId: params.userId,
      fromStage: null,
      toStage: ApplicationStageEnum.DRAFT,
      source: StageEventSourceEnum.System,
      reason: null,
      scheduledAt: null,
    });
    await this.stageEventsRepo.save(evt);
    return draftJobRowFromJobEntity(saved);
  }

  async save(rowLike: DraftJobRow): Promise<DraftJobRow> {
    const existing = await this.jobsRepo.findOne({
      where: {
        id: rowLike.id,
        userId: rowLike.userId,
        stage: ApplicationStageEnum.DRAFT,
      },
    });
    if (!existing) {
      throw new Error(`Draft row ${rowLike.id} not found`);
    }
    existing.title = rowLike.title || "";
    existing.htmlContent = rowLike.htmlContent;
    existing.urls =
      rowLike.url !== null && rowLike.url.trim() !== ""
        ? [rowLike.url.trim()]
        : [];
    existing.fillMetadata = conversionToFillEmbedded(
      rowLike.conversionMetadata ?? null,
    );
    await this.jobsRepo.save(existing);
    return draftJobRowFromJobEntity(existing);
  }

  async updateById(
    id: string,
    userId: string,
    patch: Partial<Pick<DraftJobRow, "url" | "title" | "htmlContent">>,
  ): Promise<DraftJobRow | null> {
    const existing = await this.jobsRepo.findOne({
      where: { id, userId, stage: ApplicationStageEnum.DRAFT },
    });
    if (!existing) {
      return null;
    }
    if (patch.title !== undefined) existing.title = patch.title;
    if (patch.htmlContent !== undefined)
      existing.htmlContent = patch.htmlContent;
    if (patch.url !== undefined) {
      existing.urls =
        patch.url !== null && patch.url.trim() !== "" ? [patch.url.trim()] : [];
    }
    const saved = await this.jobsRepo.save(existing);
    return draftJobRowFromJobEntity(saved);
  }

  async updateConversionMetadata(
    id: string,
    userId: string,
    expectedStatus: Pick<ConversionMetadataEmbedded, "status"> | null,
    patch: Partial<ConversionMetadataEmbedded> & {
      status: ConversionMetadataEmbedded["status"];
    },
  ): Promise<boolean> {
    const row = await this.jobsRepo.findOne({
      where: { id, userId, stage: ApplicationStageEnum.DRAFT },
    });
    if (!row) return false;

    const bucket = storedConversionBucket(row);
    const bucketMatchesExpected =
      expectedStatus === null
        ? bucket === "__empty__"
        : expectedStatus.status === DraftJobConversionStatusEnum.IDLE
          ? bucket === "__empty__" ||
            bucket === DraftJobConversionStatusEnum.IDLE
          : expectedStatus.status !== null && bucket === expectedStatus.status;

    if (!bucketMatchesExpected) {
      return false;
    }

    const prior = jobFillToConversion(row)!;
    const next: ConversionMetadataEmbedded = {
      status: patch.status,
      error: patch.error !== undefined ? patch.error : (prior.error ?? null),
      timestamp:
        patch.timestamp !== undefined
          ? patch.timestamp
          : (prior.timestamp ?? null),
    };

    row.fillMetadata = conversionToFillEmbedded(next);
    await this.jobsRepo.save(row);
    return true;
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.jobsRepo.delete({
      id,
      userId,
      stage: ApplicationStageEnum.DRAFT,
    });
  }

  async resetStaleProcessingDrafts(): Promise<number> {
    const result = await this.jobsRepo
      .createQueryBuilder()
      .update(JobEntity)
      .set({
        fillMetadata: {
          status: AsyncMetadataStatusEnum.FAILED,
          error:
            "Conversion interrupted and reset to idle after server restart.",
          timestamp: new Date(),
        },
      })
      .where(`"fill_status" = :processing`, {
        processing: AsyncMetadataStatusEnum.PROCESSING,
      })
      .andWhere(`"stage" = :draft`, { draft: ApplicationStageEnum.DRAFT })
      .execute();

    return result.affected ?? 0;
  }
}

function conversionToFillEmbedded(
  conversion: ConversionMetadataEmbedded | null,
): {
  status: AsyncMetadataStatusEnum | null;
  error: string | null;
  timestamp: Date | null;
} {
  if (
    !conversion?.status ||
    conversion.status === DraftJobConversionStatusEnum.IDLE
  ) {
    return { status: null, error: null, timestamp: null };
  }
  return {
    status: conversionStatusToAsync(conversion.status),
    error: conversion.error ?? null,
    timestamp: conversion.timestamp ?? null,
  };
}
