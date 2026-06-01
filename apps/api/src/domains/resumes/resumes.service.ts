import { isTipTapDocumentString } from "@job-tracker/tiptap";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

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

  async findDefault(userId: string): Promise<Resume | null> {
    return this.repo.findDefaultByUserId(userId);
  }

  async create(userId: string, dto: NewResume): Promise<Resume> {
    if (dto.content && !isTipTapDocumentString(dto.content)) {
      throw new BadRequestException("content must be valid TipTap document JSON");
    }

    const isFirstResume = (await this.repo.countByUserId(userId)) === 0;
    const shouldBeDefault = dto.isDefault === true || isFirstResume;

    if (shouldBeDefault) {
      await this.repo.unsetDefaultByUserId(userId);
    }

    return this.repo.create({ ...dto, userId, isDefault: shouldBeDefault });
  }

  async update(id: string, userId: string, dto: Partial<NewResume>): Promise<Resume> {
    if (dto.content !== undefined && !isTipTapDocumentString(dto.content)) {
      throw new BadRequestException("content must be valid TipTap document JSON");
    }

    if (dto.isDefault === true) {
      await this.repo.unsetDefaultByUserId(userId);
    }

    const updated = await this.repo.update(id, userId, dto);
    if (!updated) {
      throw new NotFoundException(`Resume ${id} not found`);
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const resume = await this.findOne(id, userId);

    if (resume.isDefault) {
      throw new BadRequestException("Cannot delete the default resume. Set another resume as default first.");
    }

    const deleted = await this.repo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException(`Resume ${id} not found`);
    }
  }
}
