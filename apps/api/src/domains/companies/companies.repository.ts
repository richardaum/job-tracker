import { ApplicationEntity } from "@api/database/entities/application.entity";
import { CompanyEntity } from "@api/database/entities/company.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Company, NewCompany } from "./companies.schema";

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repo: Repository<CompanyEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationsRepo: Repository<ApplicationEntity>,
  ) {}

  async findOneById(id: string, userId: string): Promise<Company | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  async findOneByName(name: string, userId: string): Promise<Company | null> {
    return this.repo.findOne({ where: { name, userId } });
  }

  async findOrCreateByName(userId: string, name: string): Promise<Company> {
    const existing = await this.findOneByName(name, userId);
    if (existing) {
      return existing;
    }
    const company = this.repo.create({ userId, name });
    return this.repo.save(company);
  }

  async create(dto: NewCompany): Promise<Company> {
    const company = this.repo.create(dto);
    return this.repo.save(company);
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<NewCompany>,
  ): Promise<Company | null> {
    const company = await this.findOneById(id, userId);
    if (!company) {
      return null;
    }
    Object.assign(company, dto);
    return this.repo.save(company);
  }

  async findAllByUserId(userId: string): Promise<Company[]> {
    return this.repo.find({ where: { userId }, order: { name: "ASC" } });
  }

  async countApplications(id: string, userId: string): Promise<number> {
    return this.applicationsRepo.count({ where: { companyId: id, userId } });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
