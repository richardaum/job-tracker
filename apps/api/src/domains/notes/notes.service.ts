import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
import { isTipTapDocumentString } from "@job-tracker/tiptap";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { NoteGenerationService } from "./ai/note-generation.service";
import { NoteRepository } from "./notes.repository";
import { Note } from "./notes.schema";

type CreateNoteDto = { applicationId: string; content: string };

type UpdateNoteDto = { content?: string; expectedRevision: number };

@Injectable()
export class NoteService {
  constructor(
    private readonly repo: NoteRepository,
    private readonly noteAiService: NoteGenerationService,
    private readonly eventBus: ApplicationEventBus,
  ) {}

  async listNotes(applicationId: string, userId: string): Promise<Note[]> {
    const hasApplication = await this.repo.hasApplication(
      applicationId,
      userId,
    );
    if (!hasApplication) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }
    return this.repo.findByApplicationIdAndUserId(applicationId, userId);
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<Note> {
    if (!isTipTapDocumentString(dto.content)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }

    const hasApplication = await this.repo.hasApplication(
      dto.applicationId,
      userId,
    );
    if (!hasApplication) {
      throw new NotFoundException(`Application ${dto.applicationId} not found`);
    }

    const note = await this.repo.create(userId, {
      applicationId: dto.applicationId,
      content: dto.content,
    });

    this.eventBus.emitApplicationUpdated(dto.applicationId, userId);
    return note;
  }

  async updateNote(
    noteId: string,
    userId: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    const note = await this.repo.findByIdAndUserId(noteId, userId);
    if (!note) {
      throw new NotFoundException(`Application note ${noteId} not found`);
    }

    const nextContent = dto.content ?? note.content;
    if (!isTipTapDocumentString(nextContent)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }

    const updated = await this.repo.updateWithRevision(
      noteId,
      userId,
      dto.expectedRevision,
      { content: nextContent },
    );

    if (!updated) {
      throw new ConflictException(
        `Application note ${noteId} revision mismatch`,
      );
    }

    this.eventBus.emitApplicationUpdated(note.applicationId, userId);
    return updated;
  }

  async removeNote(noteId: string, userId: string): Promise<Note> {
    const note = await this.repo.findByIdAndUserId(noteId, userId);
    if (!note) {
      throw new NotFoundException(`Application note ${noteId} not found`);
    }

    const deleted = await this.repo.delete(noteId, userId);
    if (!deleted) {
      throw new NotFoundException(`Application note ${noteId} not found`);
    }

    this.eventBus.emitApplicationUpdated(note.applicationId, userId);
    return deleted;
  }

  async generateNoteWithAI(
    userId: string,
    applicationId: string,
    note: string,
  ): Promise<string> {
    const application = await this.repo.findApplicationByIdAndUserId(
      applicationId,
      userId,
    );
    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }
    const description = application.description?.trim() ?? "";
    const context = `Title: ${application.title}\nCompany: ${application.company.name}\nDescription: ${description}`;
    const generated = await this.noteAiService.generateNote({
      description: context,
      note,
    });
    return JSON.stringify(generated);
  }
}
