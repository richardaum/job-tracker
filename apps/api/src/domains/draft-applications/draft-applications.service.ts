import { DraftApplicationType } from "@api/domains/draft-applications/draft-application.type";
import { Injectable, NotFoundException } from "@nestjs/common";

import { CreateDraftApplicationInput } from "./create-draft-application.input";
import { DraftApplicationsRepository } from "./draft-applications.repository";

@Injectable()
export class DraftApplicationsService {
  constructor(private readonly repo: DraftApplicationsRepository) {}

  async findAll(): Promise<DraftApplicationType[]> {
    const rows = await this.repo.findAll();
    return rows.map((row) => ({
      id: row.id,
      url: row.url,
      htmlContent: row.htmlContent,
    }));
  }

  async findOne(id: string): Promise<DraftApplicationType> {
    const row = await this.repo.findOne(id);
    if (!row) {
      throw new NotFoundException(`Draft application ${id} not found`);
    }

    return { id: row.id, url: row.url, htmlContent: row.htmlContent };
  }

  async create(
    input: CreateDraftApplicationInput,
  ): Promise<DraftApplicationType> {
    const row = await this.repo.create({
      url: input.url,
      htmlContent: input.htmlContent,
    });

    return { id: row.id, url: row.url, htmlContent: row.htmlContent };
  }
}
