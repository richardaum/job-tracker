import { JobUpdated } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { isTipTapDocumentString } from "@job-tracker/tiptap";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { NoteGenerationService } from "./ai/note-generation.service";
import { NoteRepository } from "./notes.repository";
import { Note } from "./notes.schema";

type CreateNoteDto = { jobId: string; content: string };

type UpdateNoteDto = { content?: string; expectedRevision: number };

@Injectable()
export class NoteService {
  constructor(
    private readonly repo: NoteRepository,
    private readonly noteAiService: NoteGenerationService,
    private readonly eventBus: JobEventBus,
  ) {}

  async listNotes(jobId: string, userId: string): Promise<Note[]> {
    const hasJob = await this.repo.hasJob(jobId, userId);
    if (!hasJob) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    return this.repo.findByJobIdAndUserId(jobId, userId);
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<Note> {
    if (!isTipTapDocumentString(dto.content)) {
      throw new BadRequestException("content must be valid TipTap document JSON");
    }

    const hasJob = await this.repo.hasJob(dto.jobId, userId);
    if (!hasJob) {
      throw new NotFoundException(`Job ${dto.jobId} not found`);
    }

    const note = await this.repo.create(userId, { jobId: dto.jobId, content: dto.content });

    this.eventBus.emit(new JobUpdated(dto.jobId, userId));
    return note;
  }

  async createPlainTextNote(userId: string, dto: CreateNoteDto): Promise<Note> {
    const exists = await this.repo.hasJob(dto.jobId, userId);
    if (!exists) throw new BadRequestException("Job not found");

    const note = await this.repo.create(userId, { jobId: dto.jobId, content: dto.content });

    this.eventBus.emit(new JobUpdated(dto.jobId, userId));
    return note;
  }

  async updateNote(noteId: string, userId: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.repo.findByIdAndUserId(noteId, userId);
    if (!note) {
      throw new NotFoundException(`Job note ${noteId} not found`);
    }

    const nextContent = dto.content ?? note.content;
    if (!isTipTapDocumentString(nextContent)) {
      throw new BadRequestException("content must be valid TipTap document JSON");
    }

    const updated = await this.repo.updateWithRevision(noteId, userId, dto.expectedRevision, { content: nextContent });

    if (!updated) {
      throw new ConflictException(`Job note ${noteId} revision mismatch`);
    }

    this.eventBus.emit(new JobUpdated(note.jobId, userId));
    return updated;
  }

  async removeNote(noteId: string, userId: string): Promise<Note> {
    const note = await this.repo.findByIdAndUserId(noteId, userId);
    if (!note) {
      throw new NotFoundException(`Job note ${noteId} not found`);
    }

    const deleted = await this.repo.delete(noteId, userId);
    if (!deleted) {
      throw new NotFoundException(`Job note ${noteId} not found`);
    }

    this.eventBus.emit(new JobUpdated(note.jobId, userId));
    return deleted;
  }

  async generateNoteWithAI(userId: string, jobId: string, note: string): Promise<string> {
    const job = await this.repo.findApplicationByIdAndUserId(jobId, userId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    const companyName = job.company?.name?.trim() || "Unknown company";
    const description = job.description?.trim() ?? "";
    const context = `Title: ${job.title}\nCompany: ${companyName}\nDescription: ${description}`;
    const generated = await this.noteAiService.generateNote(userId, { description: context, note });
    return JSON.stringify(generated);
  }
}
