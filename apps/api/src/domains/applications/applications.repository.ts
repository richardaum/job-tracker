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

type CreateDto = Pick<
  NewApplication,
  | "title"
  | "company"
  | "description"
  | "url"
  | "salaryMinCents"
  | "salaryMaxCents"
  | "salaryCurrency"
  | "salaryPeriod"
  | "salaryTags"
>;
type UpdateDto = Partial<CreateDto>;
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

  async findAllByUserId(userId: string): Promise<Application[]> {
    return this.applicationsRepo.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });
  }

  async findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Application | null> {
    return this.applicationsRepo.findOne({ where: { id, userId } });
  }

  async create(userId: string, dto: CreateDto): Promise<Application> {
    const row = this.applicationsRepo.create({
      userId,
      ...dto,
    });
    return this.applicationsRepo.save(row);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
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
