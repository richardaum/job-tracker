import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ApplicationRepository } from "./applications.repository";
import { Application } from "./applications.schema";
import { Note } from "./application-notes.schema";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import { ApplicationStageEnum } from "./application-stage.enum";

type CreateDto = {
  title: string;
  company: string;
  description?: string | null;
  url?: string | null;
};
type UpdateDto = Partial<CreateDto>;
type CreateStageEventDto = {
  applicationId: string;
  toStage: ApplicationStageEnum;
  source?: string;
  scheduledAt?: Date;
};
type UpdateStageEventDto = {
  toStage?: ApplicationStageEnum;
  scheduledAt?: Date | null;
};
type CreateNoteDto = {
  applicationId: string;
  content: string;
};
type UpdateNoteDto = {
  content?: string;
  expectedRevision: number;
};

function isValidTipTapDocument(value: string): boolean {
  try {
    const parsed = JSON.parse(value) as { type?: unknown; content?: unknown };
    return parsed.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

function isValidTipTapDescription(value: string): boolean {
  return isValidTipTapDocument(value);
}

@Injectable()
export class ApplicationService {
  constructor(private readonly repo: ApplicationRepository) {}

  findAll(userId: string): Promise<Application[]> {
    return this.repo.findAllByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const app = await this.repo.findOneByIdAndUserId(id, userId);
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return app;
  }

  async create(userId: string, dto: CreateDto): Promise<Application> {
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isValidTipTapDescription(dto.description)
    ) {
      throw new BadRequestException(
        "description must be valid TipTap document JSON",
      );
    }

    const application = await this.repo.create(userId, dto);
    await this.repo.createStageEvent(userId, application.id, {
      fromStage: null,
      toStage: ApplicationStageEnum.NEW,
      source: "system",
    });
    return application;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDto,
  ): Promise<Application> {
    await this.findOne(id, userId);
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isValidTipTapDescription(dto.description)
    ) {
      throw new BadRequestException(
        "description must be valid TipTap document JSON",
      );
    }
    const updated = await this.repo.update(id, userId, dto);
    if (!updated) throw new NotFoundException(`Application ${id} not found`);
    return updated;
  }

  async remove(id: string, userId: string): Promise<Application> {
    await this.findOne(id, userId);
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new NotFoundException(`Application ${id} not found`);
    return deleted;
  }

  async listStageEvents(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStageEvent[]> {
    await this.findOne(applicationId, userId);
    return this.repo.findStageEventsByApplicationIdAndUserId(
      applicationId,
      userId,
    );
  }

  async createStageEvent(
    userId: string,
    dto: CreateStageEventDto,
  ): Promise<ApplicationStageEvent> {
    await this.findOne(dto.applicationId, userId);
    const latest = await this.repo.findLatestStageEventByApplicationIdAndUserId(
      dto.applicationId,
      userId,
    );
    return this.repo.createStageEvent(userId, dto.applicationId, {
      fromStage: latest?.toStage ?? null,
      toStage: dto.toStage,
      source: dto.source ?? "manual",
      scheduledAt: dto.scheduledAt,
    });
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: UpdateStageEventDto,
  ): Promise<ApplicationStageEvent> {
    const stageEvent = await this.repo.findStageEventByIdAndUserId(
      stageEventId,
      userId,
    );
    if (!stageEvent) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }

    const updated = await this.repo.updateStageEvent(stageEventId, userId, {
      toStage: dto.toStage,
      scheduledAt: dto.scheduledAt,
    });
    if (!updated) {
      throw new NotFoundException(`Stage event ${stageEventId} not found`);
    }
    return updated;
  }

  async listNotes(applicationId: string, userId: string): Promise<Note[]> {
    await this.findOne(applicationId, userId);
    return this.repo.findNotesByApplicationIdAndUserId(applicationId, userId);
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<Note> {
    if (!isValidTipTapDocument(dto.content)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }
    await this.findOne(dto.applicationId, userId);

    return this.repo.createNote(userId, {
      applicationId: dto.applicationId,
      content: dto.content,
    });
  }

  async updateNote(
    noteId: string,
    userId: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    const note = await this.repo.findNoteByIdAndUserId(noteId, userId);
    if (!note)
      throw new NotFoundException(`Application note ${noteId} not found`);
    const nextContent = dto.content ?? note.content;
    if (!isValidTipTapDocument(nextContent)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }

    const updated = await this.repo.updateNoteWithRevision(
      noteId,
      userId,
      dto.expectedRevision,
      {
        content: nextContent,
      },
    );

    if (!updated) {
      throw new ConflictException(
        `Application note ${noteId} revision mismatch`,
      );
    }

    return updated;
  }

  async removeNote(noteId: string, userId: string): Promise<Note> {
    const note = await this.repo.findNoteByIdAndUserId(noteId, userId);
    if (!note)
      throw new NotFoundException(`Application note ${noteId} not found`);

    const deleted = await this.repo.deleteNote(noteId, userId);
    if (!deleted)
      throw new NotFoundException(`Application note ${noteId} not found`);
    return deleted;
  }
}
