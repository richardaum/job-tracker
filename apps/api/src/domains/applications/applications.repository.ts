import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { tipTapDocumentToPlainText } from "@api/domains/shared/tiptap.util";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";
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
>;
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
      qb.andWhere(`${latestStageSub} = 'new'`, { userId });
    } else if (filter === ApplicationQuickFilterEnum.APPLIED) {
      qb.andWhere(`${latestStageSub} = 'applied'`, { userId });
    } else if (filter === ApplicationQuickFilterEnum.ACTIVE) {
      qb.andWhere(`${latestStageSub} NOT IN ('new', 'applied', 'rejected')`, {
        userId,
      });
    } else if (filter === ApplicationQuickFilterEnum.INCOMING) {
      qb.andWhere(`${latestStageSub} NOT IN ('applied', 'rejected')`, {
        userId,
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
      const raw = row.description;
      if (raw === null || raw.trim().length === 0) {
        continue;
      }
      const plain = tipTapDocumentToPlainText(raw);
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
    const row = this.applicationsRepo.create({ userId, ...dto });
    return this.applicationsRepo.save(row);
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
}
