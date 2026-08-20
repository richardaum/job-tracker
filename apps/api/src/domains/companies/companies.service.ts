import { isTipTapDocumentString } from "@job-tracker/tiptap";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { CompanyRepository } from "./companies.repository";
import { Company, NewCompany } from "./companies.schema";

type CompanyRepositoryPort = Pick<
  CompanyRepository,
  | "findAllByUserId"
  | "findOneById"
  | "findOneByNameInsensitiveTrimmed"
  | "findOrCreateByName"
  | "update"
  | "countJobs"
  | "delete"
>;

@Injectable()
export class CompanyService {
  constructor(@Inject(CompanyRepository) private readonly repo: CompanyRepositoryPort) {}

  async findAll(userId: string): Promise<Company[]> {
    return this.repo.findAllByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<Company> {
    const company = await this.repo.findOneById(id, userId);
    if (!company) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    return company;
  }

  async findOrCreateByName(userId: string, name: string): Promise<Company> {
    return this.repo.findOrCreateByName(userId, name);
  }

  async update(id: string, userId: string, dto: Partial<NewCompany>): Promise<Company> {
    if (dto.description !== undefined && dto.description !== null && !isTipTapDocumentString(dto.description)) {
      throw new BadRequestException("description must be valid TipTap document JSON");
    }

    let patch = dto;
    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new BadRequestException("Company name cannot be empty.");
      }
      const clash = await this.repo.findOneByNameInsensitiveTrimmed(userId, trimmed);
      if (clash && clash.id !== id) {
        throw new ConflictException("Another company already uses this name (case-insensitive).");
      }
      patch = { ...dto, name: trimmed };
    }

    const updated = await this.repo.update(id, userId, patch);
    if (!updated) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    return updated;
  }

  async jobsCount(id: string, userId: string): Promise<number> {
    await this.findOne(id, userId);
    return this.repo.countJobs(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    const deleted = await this.repo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException(`Company ${id} not found`);
    }
  }
}
