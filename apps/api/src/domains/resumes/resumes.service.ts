import { isTipTapDocumentString } from "@api/domains/shared/tiptap.util";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ResumeRepository } from "./resumes.repository";
import { NewResume, Resume } from "./resumes.schema";

@Injectable()
export class ResumeService {
  constructor(private readonly repo: ResumeRepository) {}

  async findAll(userId: string): Promise<Resume[]> {
    return this.repo.findAllByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<Resume> {
    const resume = await this.repo.findOneById(id, userId);
    if (!resume) {
      throw new NotFoundException(`Resume ${id} not found`);
    }
    return resume;
  }

  async create(userId: string, dto: NewResume): Promise<Resume> {
    if (dto.content && !isTipTapDocumentString(dto.content)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }

    return this.repo.create({ ...dto, userId });
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<NewResume>,
  ): Promise<Resume> {
    if (dto.content !== undefined && !isTipTapDocumentString(dto.content)) {
      throw new BadRequestException(
        "content must be valid TipTap document JSON",
      );
    }

    const updated = await this.repo.update(id, userId, dto);
    if (!updated) {
      throw new NotFoundException(`Resume ${id} not found`);
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    const deleted = await this.repo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException(`Resume ${id} not found`);
    }
  }
}
