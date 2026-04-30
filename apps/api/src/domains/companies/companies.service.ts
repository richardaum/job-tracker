import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CompanyRepository } from "./companies.repository";
import { Company, NewCompany } from "./companies.schema";
import { isTipTapDocumentString } from "@api/domains/shared/tiptap.util";

@Injectable()
export class CompanyService {
  constructor(private readonly repo: CompanyRepository) {}

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

  async update(
    id: string,
    userId: string,
    dto: Partial<NewCompany>,
  ): Promise<Company> {
    if (
      dto.description !== undefined &&
      dto.description !== null &&
      !isTipTapDocumentString(dto.description)
    ) {
      throw new BadRequestException(
        "description must be valid TipTap document JSON",
      );
    }

    const updated = await this.repo.update(id, userId, dto);
    if (!updated) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    return updated;
  }

  async applicationsCount(id: string, userId: string): Promise<number> {
    await this.findOne(id, userId);
    return this.repo.countApplications(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    const deleted = await this.repo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException(`Company ${id} not found`);
    }
  }
}
