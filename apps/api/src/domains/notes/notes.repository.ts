import { JobEntity } from "@api/database/entities/job.entity";
import { JobNoteEntity } from "@api/database/entities/job-note.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { NewNote, Note } from "./notes.schema";

type CreateNoteDto = Pick<NewNote, "jobId" | "content">;
type UpdateNoteDto = Pick<NewNote, "content">;

@Injectable()
export class NoteRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly applicationsRepo: Repository<JobEntity>,
    @InjectRepository(JobNoteEntity)
    private readonly notesRepo: Repository<JobNoteEntity>,
  ) {}

  async hasJob(jobId: string, userId: string): Promise<boolean> {
    const count = await this.applicationsRepo.count({
      where: { id: jobId, userId },
    });
    return count > 0;
  }

  async findApplicationByIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<JobEntity | null> {
    return this.applicationsRepo.findOne({
      where: { id: jobId, userId },
      relations: ["company"],
    });
  }

  async findByJobIdAndUserId(jobId: string, userId: string): Promise<Note[]> {
    return this.notesRepo.find({
      where: { jobId, userId },
      order: { createdAt: "DESC", id: "DESC" },
    });
  }

  async findByIdAndUserId(
    noteId: string,
    userId: string,
  ): Promise<Note | null> {
    return this.notesRepo.findOne({ where: { id: noteId, userId } });
  }

  async create(userId: string, dto: CreateNoteDto): Promise<Note> {
    const row = this.notesRepo.create({
      userId,
      jobId: dto.jobId,
      content: dto.content,
    });
    return this.notesRepo.save(row);
  }

  async updateWithRevision(
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
    return this.findByIdAndUserId(noteId, userId);
  }

  async delete(noteId: string, userId: string): Promise<Note | null> {
    const existing = await this.findByIdAndUserId(noteId, userId);
    if (!existing) {
      return null;
    }
    await this.notesRepo.delete({ id: noteId, userId });
    return existing;
  }
}
