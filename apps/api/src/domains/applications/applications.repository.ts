import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";

import { Application, NewApplication } from "./applications.schema";
import {
  ApplicationStageEvent,
  NewApplicationStageEvent,
} from "./application-stage-events.schema";
import { Note, NewNote } from "./application-notes.schema";
import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";

export type CreateApplicationRepoDto = Pick<
  NewApplication,
  | "title"
  | "companyId"
  | "description"
  | "url"
  | "salaryMinCents"
  | "salaryMaxCents"
  | "salaryCurrency"
  | "salaryPeriod"
  | "tags"
>;
export type UpdateApplicationRepoDto = Partial<CreateApplicationRepoDto>;
type CreateStageEventDto = Pick<
  NewApplicationStageEvent,
  "toStage" | "source" | "scheduledAt"
> & {
  fromStage?: NewApplicationStageEvent["fromStage"];
};
type UpdateStageEventDto = Pick<
  NewApplicationStageEvent,
  "toStage" | "scheduledAt"
>;
type CreateNoteDto = Pick<NewNote, "applicationId" | "content">;
type UpdateNoteDto = Pick<NewNote, "content">;

@Injectable()
export class ApplicationRepository {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationsRepo: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationStageEventEntity)
    private readonly stageEventsRepo: Repository<ApplicationStageEventEntity>,
    @InjectRepository(ApplicationNoteEntity)
    private readonly notesRepo: Repository<ApplicationNoteEntity>,
  ) {}

  async findAllByUserId(
    userId: string,
    filter?: ApplicationQuickFilterEnum,
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
      qb.andWhere(`${latestStageSub} NOT IN ('new', 'rejected')`, { userId });
    } else if (filter === ApplicationQuickFilterEnum.INCOMING) {
      qb.andWhere(`${latestStageSub} != 'rejected'`, { userId }).andWhere(
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
    const row = this.applicationsRepo.create({
      userId,
      ...dto,
    });
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
    return this.stageEventsRepo.save(existing);
  }

  async findNotesByApplicationIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<Note[]> {
    return this.notesRepo.find({
      where: { applicationId, userId },
      order: { createdAt: "DESC", id: "DESC" },
    });
  }

  async findNoteByIdAndUserId(
    noteId: string,
    userId: string,
  ): Promise<Note | null> {
    return this.notesRepo.findOne({ where: { id: noteId, userId } });
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<Note> {
    const row = this.notesRepo.create({
      userId,
      applicationId: dto.applicationId!,
      content: dto.content,
    });
    return this.notesRepo.save(row);
  }

  async updateNoteWithRevision(
    noteId: string,
    userId: string,
    expectedRevision: number,
    dto: UpdateNoteDto,
  ): Promise<Note | null> {
    const result = await this.notesRepo.update(
      { id: noteId, userId, revision: expectedRevision },
      {
        content: dto.content,
        revision: expectedRevision + 1,
        updatedAt: new Date(),
      },
    );
    if (!result.affected) {
      return null;
    }
    return this.findNoteByIdAndUserId(noteId, userId);
  }

  async deleteNote(noteId: string, userId: string): Promise<Note | null> {
    const existing = await this.findNoteByIdAndUserId(noteId, userId);
    if (!existing) {
      return null;
    }
    await this.notesRepo.delete({ id: noteId, userId });
    return existing;
  }
}
