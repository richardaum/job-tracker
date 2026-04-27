import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { Note, NewNote } from "./notes.schema";

type CreateNoteDto = Pick<NewNote, "applicationId" | "content">;
type UpdateNoteDto = Pick<NewNote, "content">;

@Injectable()
export class NoteRepository {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationsRepo: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationNoteEntity)
    private readonly notesRepo: Repository<ApplicationNoteEntity>,
  ) {}

  async hasApplication(
    applicationId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.applicationsRepo.count({
      where: { id: applicationId, userId },
    });
    return count > 0;
  }

  async findApplicationByIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationEntity | null> {
    return this.applicationsRepo.findOne({
      where: { id: applicationId, userId },
      relations: ["company"],
    });
  }

  async findByApplicationIdAndUserId(
    applicationId: string,
    userId: string,
  ): Promise<Note[]> {
    return this.notesRepo.find({
      where: { applicationId, userId },
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
      applicationId: dto.applicationId,
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
