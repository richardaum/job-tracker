import { JobEntity } from "@api/database/entities/job.entity";
import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { ApplicationStageEnum } from "./job-stage.enum";
import { Job } from "./jobs.schema";

export type JobPostingContextSnippet = { title: string; plainTextDescription: string };

@Injectable()
export class JobsListQuery {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepo: Repository<JobEntity>,
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
      qb.andWhere("LOWER(company.name) = LOWER(:company)", { company: normalizedCompany });
    }

    const normalizedRunId = runId?.trim();
    if (normalizedRunId) {
      qb.andWhere("a.source_run_id = :runId", { runId: normalizedRunId });
    }

    if (!filter) {
      return qb.getMany();
    }

    if (filter === ApplicationQuickFilterEnum.Draft) {
      qb.andWhere("a.stage = :draftStage", { draftStage: ApplicationStageEnum.Draft });
      return qb.getMany();
    }

    /** Non-DRAFT quick filters derive state from stage events — still exclude persisted DRAFT rows. */
    qb.andWhere("a.stage != :draftExclude", { draftExclude: ApplicationStageEnum.Draft });

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

    if (filter === ApplicationQuickFilterEnum.New) {
      qb.andWhere(`${latestStageSub} = :stage`, { userId, stage: ApplicationStageEnum.New });
    } else if (filter === ApplicationQuickFilterEnum.Duplicated) {
      qb.andWhere(`${latestStageSub} = :stage`, { userId, stage: ApplicationStageEnum.Duplicated });
    } else if (filter === ApplicationQuickFilterEnum.Rejected) {
      qb.andWhere(`${latestStageSub} = :stage`, { userId, stage: ApplicationStageEnum.Rejected });
    } else if (filter === ApplicationQuickFilterEnum.Applied) {
      qb.andWhere(`${latestStageSub} = :stage`, { userId, stage: ApplicationStageEnum.Applied });
    } else if (filter === ApplicationQuickFilterEnum.Active) {
      qb.andWhere(`${latestStageSub} NOT IN (:...stages)`, {
        userId,
        stages: [
          ApplicationStageEnum.New,
          ApplicationStageEnum.Applied,
          ApplicationStageEnum.Rejected,
          ApplicationStageEnum.Duplicated,
        ],
      }).andWhere(`${latestStageSub} != :excludeDraftLatestEvtActive`, {
        userId,
        excludeDraftLatestEvtActive: ApplicationStageEnum.Draft,
      });
    } else if (filter === ApplicationQuickFilterEnum.Incoming) {
      qb.andWhere(`${latestStageSub} NOT IN (:...stages)`, {
        userId,
        stages: [ApplicationStageEnum.Applied, ApplicationStageEnum.Rejected, ApplicationStageEnum.Duplicated],
      })
        .andWhere(`${latestStageSub} != :excludeDraftLatestEvtIncoming`, {
          userId,
          excludeDraftLatestEvtIncoming: ApplicationStageEnum.Draft,
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
      .andWhere("a.stage != :excludeDraftPostingSnippet", { excludeDraftPostingSnippet: ApplicationStageEnum.Draft })
      .andWhere("LOWER(TRIM(c.name)) = LOWER(TRIM(:company))", { company: normalized })
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
}
