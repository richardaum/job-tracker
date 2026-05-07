import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class DraftApplicationsRepository {
  constructor(
    @InjectRepository(DraftApplicationEntity)
    private readonly draftApplicationsRepo: Repository<DraftApplicationEntity>,
  ) {}

  async findAll(): Promise<DraftApplicationEntity[]> {
    return this.draftApplicationsRepo.find({ order: { id: "DESC" } });
  }

  async findOne(id: string): Promise<DraftApplicationEntity | null> {
    return this.draftApplicationsRepo.findOne({ where: { id } });
  }

  async create(params: {
    url: string;
    title: string;
    htmlContent: string;
  }): Promise<DraftApplicationEntity> {
    const row = this.draftApplicationsRepo.create({
      url: params.url,
      title: params.title,
      htmlContent: params.htmlContent,
    });

    return this.draftApplicationsRepo.save(row);
  }

  async deleteById(id: string): Promise<void> {
    await this.draftApplicationsRepo.delete({ id });
  }
}
