import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { tryRun } from "@job-tracker/try-run";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";

import { Company, NewCompany } from "./companies.schema";

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repo: Repository<CompanyEntity>,
    @InjectRepository(JobEntity)
    private readonly applicationsRepo: Repository<JobEntity>,
  ) {}

  async findOneById(id: string, userId: string): Promise<Company | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  async findOneByNameInsensitiveTrimmed(
    userId: string,
    name: string,
  ): Promise<Company | null> {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    return this.repo
      .createQueryBuilder("c")
      .where("c.user_id = :userId", { userId })
      .andWhere("LOWER(TRIM(c.name)) = LOWER(TRIM(:name))", { name: trimmed })
      .getOne();
  }

  async findOrCreateByName(userId: string, name: string): Promise<Company> {
    const trimmed = name.trim();
    const existing = await this.findOneByNameInsensitiveTrimmed(
      userId,
      trimmed,
    );
    if (existing) {
      return existing;
    }

    const [saveErr, company] = await tryRun(
      this.repo.save(this.repo.create({ userId, name: trimmed })),
    );
    if (!saveErr) {
      return company;
    }
    if (
      saveErr instanceof QueryFailedError &&
      (saveErr.driverError as { code?: string } | undefined)?.code === "23505"
    ) {
      const afterRace = await this.findOneByNameInsensitiveTrimmed(
        userId,
        trimmed,
      );
      if (afterRace) {
        return afterRace;
      }
    }
    throw saveErr;
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
