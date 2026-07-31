import { ResumeEntity } from "@api/database/entities/resume.entity";
import { assignIfDefined } from "@api/lib/assign-if-defined";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { NewResume, Resume } from "./resumes.schema";

@Injectable()
export class ResumeRepository {
  constructor(
    @InjectRepository(ResumeEntity)
    private readonly repo: Repository<ResumeEntity>,
  ) {}

  async findAllByUserId(userId: string): Promise<Resume[]> {
    return this.repo.find({ where: { userId }, order: { isDefault: "DESC", updatedAt: "DESC" } });
  }

  async findDefaultByUserId(userId: string): Promise<Resume | null> {
    return this.repo.findOne({ where: { userId, isDefault: true } });
  }

  async unsetDefaultByUserId(userId: string): Promise<void> {
    await this.repo.update({ userId, isDefault: true }, { isDefault: false });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  async findOneById(id: string, userId: string): Promise<Resume | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  async create(dto: NewResume): Promise<Resume> {
    const resume = this.repo.create(dto);
    return this.repo.save(resume);
  }

  async update(id: string, userId: string, dto: Partial<NewResume>): Promise<Resume | null> {
    const resume = await this.findOneById(id, userId);
    if (!resume) {
      return null;
    }
    assignIfDefined(resume, "title", dto.title);
    assignIfDefined(resume, "content", dto.content);
    assignIfDefined(resume, "isDefault", dto.isDefault);
    return this.repo.save(resume);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
