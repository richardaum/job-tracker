import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { isTipTapDocumentString } from "@api/domains/shared/tiptap.util";
import { NoteRepository } from "./notes.repository";
import { Note } from "./notes.schema";
import { NoteAiService } from "@api/domains/note-ai/note-ai.service";

type CreateNoteDto = {
  applicationId: string;
  content: string;
};

type UpdateNoteDto = {
  content?: string;
  expectedRevision: number;
};

@Injectable()
export class NoteService {
  constructor(
    private readonly repo: NoteRepository,
    private readonly noteAiService: NoteAiService,
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

    return this.repo.create(userId, {
      applicationId: dto.applicationId,
      content: dto.content,
    });
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

  async rewriteTextWithAI(
    userId: string,
    applicationId: string,
    text: string,
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

    return this.noteAiService.rewriteTextAsSingleParagraph({
      description: context,
      text,
    });
  }
}
