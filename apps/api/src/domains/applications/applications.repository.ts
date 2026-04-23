import { Injectable } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import { DatabaseService } from "@api/database/database.service";
import {
  applications,
  Application,
  NewApplication,
} from "./applications.schema";
import {
  ApplicationStageEvent,
  applicationStageEvents,
  NewApplicationStageEvent,
} from "./application-stage-events.schema";
import { Note, notes, NewNote } from "./application-notes.schema";

type CreateDto = Pick<
  NewApplication,
  "title" | "company" | "description" | "url"
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
  constructor(private readonly db: DatabaseService) {}

  async findAllByUserId(userId: string): Promise<Application[]> {
    return this.db.db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));
  }

  async findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Application | null> {
    const result = await this.db.db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(userId: string, dto: CreateDto): Promise<Application> {
    const result = await this.db.db
      .insert(applications)
      .values({ userId, ...dto })
      .returning();
    return result[0];
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
  ): Promise<Application | null> {
    const result = await this.db.db
      .update(applications)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string, userId: string): Promise<Application | null> {
    const result = await this.db.db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return result[0] ?? null;
  }

  async findStageEventsByApplicationIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStageEvent[]> {
    return this.db.db
      .select()
      .from(applicationStageEvents)
      .where(
        and(
          eq(applicationStageEvents.applicationId, applicationId),
          eq(applicationStageEvents.userId, userId),
        ),
      )
      .orderBy(
        desc(
          sql`coalesce(${applicationStageEvents.scheduledAt}, ${applicationStageEvents.createdAt})`,
        ),
        desc(applicationStageEvents.createdAt),
        desc(applicationStageEvents.id),
      );
  }

  async findLatestStageEventByApplicationIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStageEvent | null> {
    const result = await this.db.db
      .select()
      .from(applicationStageEvents)
      .where(
        and(
          eq(applicationStageEvents.applicationId, applicationId),
          eq(applicationStageEvents.userId, userId),
        ),
      )
      .orderBy(
        desc(applicationStageEvents.createdAt),
        desc(applicationStageEvents.id),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async findStageEventByIdAndUserId(
    stageEventId: string,
    userId: string,
  ): Promise<ApplicationStageEvent | null> {
    const result = await this.db.db
      .select()
      .from(applicationStageEvents)
      .where(
        and(
          eq(applicationStageEvents.id, stageEventId),
          eq(applicationStageEvents.userId, userId),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async createStageEvent(
    userId: string,
    applicationId: string,
    dto: CreateStageEventDto,
  ): Promise<ApplicationStageEvent> {
    const result = await this.db.db
      .insert(applicationStageEvents)
      .values({
        userId,
        applicationId,
        fromStage: dto.fromStage ?? null,
        toStage: dto.toStage,
        source: dto.source ?? "manual",
        scheduledAt: dto.scheduledAt ?? null,
      })
      .returning();
    return result[0];
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: Partial<UpdateStageEventDto>,
  ): Promise<ApplicationStageEvent | null> {
    const result = await this.db.db
      .update(applicationStageEvents)
      .set({
        ...(dto.toStage !== undefined ? { toStage: dto.toStage } : {}),
        ...(dto.scheduledAt !== undefined
          ? { scheduledAt: dto.scheduledAt }
          : {}),
      })
      .where(
        and(
          eq(applicationStageEvents.id, stageEventId),
          eq(applicationStageEvents.userId, userId),
        ),
      )
      .returning();
    return result[0] ?? null;
  }

  async findNotesByApplicationIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<Note[]> {
    return this.db.db
      .select()
      .from(notes)
      .where(
        and(eq(notes.userId, userId), eq(notes.applicationId, applicationId)),
      )
      .orderBy(desc(notes.createdAt), desc(notes.id));
  }

  async findNoteByIdAndUserId(
    noteId: string,
    userId: string,
  ): Promise<Note | null> {
    const result = await this.db.db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<Note> {
    const result = await this.db.db
      .insert(notes)
      .values({
        userId,
        applicationId: dto.applicationId ?? null,
        content: dto.content,
      })
      .returning();
    return result[0];
  }

  async updateNoteWithRevision(
    noteId: string,
    userId: string,
    expectedRevision: number,
    dto: UpdateNoteDto,
  ): Promise<Note | null> {
    const result = await this.db.db
      .update(notes)
      .set({
        content: dto.content,
        revision: expectedRevision + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notes.id, noteId),
          eq(notes.userId, userId),
          eq(notes.revision, expectedRevision),
        ),
      )
      .returning();
    return result[0] ?? null;
  }

  async deleteNote(noteId: string, userId: string): Promise<Note | null> {
    const result = await this.db.db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();
    return result[0] ?? null;
  }
}
