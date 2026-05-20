import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import type { AsyncMetadata } from "@api/domains/shared/async-metadata.type";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";
import { ApplicationStageEnum } from "./application-stage.enum";
import {
  ApplicationStageEvent,
  NewApplicationStageEvent,
} from "./application-stage-events.schema";
import { Application, NewApplication } from "./applications.schema";

export type CreateApplicationRepoDto = Pick<
  NewApplication,
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
> & { draftApplicationId?: string | null; sourceRunId?: string | null };
export type UpdateApplicationRepoDto = Partial<CreateApplicationRepoDto>;

export type JobPostingContextSnippet = {
  title: string;
  plainTextDescription: string;
};
type CreateStageEventDto = Pick<
  NewApplicationStageEvent,
  "toStage" | "source" | "reason" | "scheduledAt"
> & { fromStage?: NewApplicationStageEvent["fromStage"] };
type UpdateStageEventDto = Pick<
  NewApplicationStageEvent,
  "toStage" | "reason" | "scheduledAt"
>;

@Injectable()
export class ApplicationRepository {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationsRepo: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationStageEventEntity)
    private readonly stageEventsRepo: Repository<ApplicationStageEventEntity>,
  ) {}

  async findAllByUserId(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
    company?: string,
    runId?: string,
  ): Promise<Application[]> {
    const qb = this.applicationsRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.company", "company")
      .where("a.user_id = :userId", { userId })
      .orderBy(
        `(
          SELECT COALESCE(e.schedule_at, e.created_at)
          FROM application_stage_events e
          WHERE e.application_id = a.id AND e.user_id = :userId
          ORDER BY COALESCE(e.schedule_at, e.created_at) DESC, e.created_at DESC, e.id DESC
          LIMIT 1
        )`,
        "DESC",
        "NULLS LAST",
      );

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

    const latestStageSub = `(
      SELECT e.to_stage FROM application_stage_events e
      WHERE e.application_id = a.id AND e.user_id = :userId
      ORDER BY COALESCE(e.schedule_at, e.created_at) DESC, e.created_at DESC, e.id DESC
      LIMIT 1
    )`;

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
      qb.andWhere(`${latestStageSub} NOT IN (:...stages)`, {
        userId,
        stages: [
          ApplicationStageEnum.NEW,
          ApplicationStageEnum.APPLIED,
          ApplicationStageEnum.REJECTED,
          ApplicationStageEnum.DUPLICATED,
        ],
      });
    } else if (filter === ApplicationQuickFilterEnum.INCOMING) {
      qb.andWhere(`${latestStageSub} NOT IN (:...stages)`, {
        userId,
        stages: [
          ApplicationStageEnum.APPLIED,
          ApplicationStageEnum.REJECTED,
          ApplicationStageEnum.DUPLICATED,
        ],
      }).andWhere(
        `EXISTS (
          SELECT 1 FROM application_stage_events e
          WHERE e.application_id = a.id AND e.user_id = :userId
          AND e.schedule_at >= :today
        )`,
        { userId, today: new Date(new Date().setHours(0, 0, 0, 0)) },
      );
    }

    return qb.getMany();
  }

  /**
   * Up to two recent applications for this user whose company matches (case-insensitive, trimmed),
   * with non-empty plaintext extracted from TipTap descriptions.
   */
  async findUpToTwoJobPostingContextsByCompanyName(
    userId: string,
    companyName: string,
  ): Promise<JobPostingContextSnippet[]> {
    const normalized = companyName.trim();
    if (!normalized) {
      return [];
    }

    const rows = await this.applicationsRepo
      .createQueryBuilder("a")
      .innerJoin("a.company", "c")
      .where("a.user_id = :userId", { userId })
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
      const title =
        row.title.trim().length > 0 ? row.title.trim() : "(no title)";
      contexts.push({ title, plainTextDescription: plain });
      if (contexts.length >= 2) {
        break;
      }
    }

    return contexts;
  }

  /**
   * Another application (same user, same company, same trimmed title, case-insensitive)
   * created on or after `referenceTime - lookbackMs`.
   */
  async hasRecentDuplicateSameRoleAndCompany(
    userId: string,
    excludeApplicationId: string,
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
    const count = await this.applicationsRepo
      .createQueryBuilder("a")
      .where("a.user_id = :userId", { userId })
      .andWhere("a.id != :excludeApplicationId", { excludeApplicationId })
      .andWhere("a.company_id = :companyId", { companyId })
      .andWhere("LOWER(TRIM(a.title)) = LOWER(:titleNorm)", {
        titleNorm: trimmedTitle,
      })
      .andWhere("a.created_at >= :cutoff", { cutoff })
      .getCount();
    return count > 0;
  }

  async findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Application | null> {
    return this.applicationsRepo.findOne({
      where: { id, userId },
      relations: ["company"],
    });
  }

  async create(
    userId: string,
    dto: CreateApplicationRepoDto,
  ): Promise<Application> {
    const { draftApplicationId, sourceRunId, ...rest } = dto;
    const row = this.applicationsRepo.create({
      userId,
      ...rest,
      sourceRunId: sourceRunId ?? null,
      draftApplication: draftApplicationId
        ? ({ id: draftApplicationId } as DraftApplicationEntity)
        : undefined,
    });
    return this.applicationsRepo.save(row);
  }

  async findDraftApplicationId(
    id: string,
    userId: string,
  ): Promise<string | null> {
    const row = await this.applicationsRepo
      .createQueryBuilder("a")
      .select("a.draft_application_id", "draftApplicationId")
      .where("a.id = :id AND a.user_id = :userId", { id, userId })
      .getRawOne<{ draftApplicationId: string }>();

    return row?.draftApplicationId ?? null;
  }

  async detachApplicationsSourceRun(
    sourceRunId: string,
    userId: string,
  ): Promise<number> {
    const result = await this.applicationsRepo.update(
      { userId, sourceRunId },
      { sourceRunId: null },
    );
    return result.affected ?? 0;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateApplicationRepoDto,
  ): Promise<Application | null> {
    const existing = await this.findOneByIdAndUserId(id, userId);
    if (!existing) {
      return null;
    }
    Object.assign(existing, dto);
    return this.applicationsRepo.save(existing);
  }

  async delete(id: string, userId: string): Promise<Application | null> {
    const existing = await this.findOneByIdAndUserId(id, userId);
    if (!existing) {
      return null;
    }
    await this.applicationsRepo.delete({ id, userId });
    return existing;
  }

  async findStageEventsByApplicationIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStageEvent[]> {
    return this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.application_id = :applicationId AND e.user_id = :userId", {
        applicationId,
        userId,
      })
      .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .getMany();
  }

  async findLatestStageEventByApplicationIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStageEvent | null> {
    return this.stageEventsRepo.findOne({
      where: { applicationId, userId },
      order: { createdAt: "DESC", id: "DESC" },
    });
  }

  /**
   * Latest event per application (order: COALESCE(schedule_at, created_at) desc),
   * one round-trip. Used to expose current stage on `Application` without N+1.
   */
  async findLatestStageSummariesByApplicationIds(
    userId: string,
    applicationIds: string[],
  ): Promise<
    Map<
      string,
      {
        toStage: NewApplicationStageEvent["toStage"];
        reason: string | null;
        statusAt: Date;
      }
    >
  > {
    const result = new Map<
      string,
      {
        toStage: NewApplicationStageEvent["toStage"];
        reason: string | null;
        statusAt: Date;
      }
    >();
    if (applicationIds.length === 0) {
      return result;
    }
    const events = await this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.user_id = :userId", { userId })
      .andWhere("e.application_id IN (:...ids)", { ids: applicationIds })
      .orderBy("e.application_id", "ASC")
      .addOrderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .getMany();

    for (const ev of events) {
      if (result.has(ev.applicationId)) {
        continue;
      }
      result.set(ev.applicationId, {
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
  ): Promise<ApplicationStageEvent | null> {
    return this.stageEventsRepo.findOne({
      where: { id: stageEventId, userId },
    });
  }

  async createStageEvent(
    userId: string,
    applicationId: string,
    dto: CreateStageEventDto,
  ): Promise<ApplicationStageEvent> {
    const row = this.stageEventsRepo.create({
      userId,
      applicationId,
      fromStage: dto.fromStage ?? null,
      toStage: dto.toStage,
      source: dto.source ?? "manual",
      reason: dto.reason ?? null,
      scheduledAt: dto.scheduledAt ?? null,
    });
    return this.stageEventsRepo.save(row);
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: Partial<UpdateStageEventDto>,
  ): Promise<ApplicationStageEvent | null> {
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
    applicationId: string,
    expectedStatus: Pick<AsyncMetadata, "status"> | null,
    patch: Partial<AsyncMetadata> & { status: AsyncMetadata["status"] },
    userId: string,
  ): Promise<boolean> {
    const summaryUpdate: Partial<AsyncMetadataEmbedded> = {
      status: patch.status,
    };
    if (patch.error !== undefined) {
      summaryUpdate.error = patch.error;
    }
    if (patch.timestamp !== undefined) {
      summaryUpdate.timestamp = new Date(patch.timestamp);
    }

    const qb = this.applicationsRepo
      .createQueryBuilder()
      .update(ApplicationEntity)
      .set({ summaryMetadata: summaryUpdate })
      .where(`"id" = :id AND "user_id" = :userId`, {
        id: applicationId,
        userId,
      });

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
    applicationId: string,
    summary: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.applicationsRepo.update(
      { id: applicationId, userId },
      { summary },
    );
    return (result.affected ?? 0) > 0;
  }

  async resetStaleSummaryProcessing(): Promise<number> {
    const result = await this.applicationsRepo
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
}
