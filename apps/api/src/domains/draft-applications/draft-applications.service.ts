import { DraftApplicationEntity } from "@api/database/entities/draft-application.entity";
import { DraftApplicationType } from "@api/domains/draft-applications/draft-application.type";
import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";

import { CreateDraftApplicationInput } from "./create-draft-application.input";
import { DraftApplicationsRepository } from "./draft-applications.repository";

@Injectable()
export class DraftApplicationsService implements OnModuleInit {
  private readonly logger = new Logger(DraftApplicationsService.name);

  constructor(private readonly repo: DraftApplicationsRepository) {}

  async onModuleInit(): Promise<void> {
    const recovered = await this.repo.resetStaleProcessingDrafts();
    if (recovered > 0) {
      this.logger.warn(
        `Recovered ${recovered} stale draft conversion(s) back to idle`,
      );
    }
  }

  async deleteAllLinkedApplications(
    draftId: string,
    userId: string,
  ): Promise<void> {
    await this.repo.deleteApplicationsByDraftId(draftId, userId);
  }

  private async toType(
    row: DraftApplicationEntity,
  ): Promise<DraftApplicationType> {
    const applicationId = await this.repo.findLatestApplicationIdByDraftId(
      row.id,
    );
    return {
      id: row.id,
      url: row.url,
      title: row.title,
      htmlContent: row.htmlContent,
      applicationId,
      conversionStatus: row.conversionStatus,
      conversionError: row.conversionError,
      convertedAt: row.convertedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<DraftApplicationType[]> {
    const rows = await this.repo.findAll();
    return Promise.all(rows.map((row) => this.toType(row)));
  }

  async findOne(id: string): Promise<DraftApplicationType> {
    const row = await this.repo.findOne(id);
    if (!row) {
      throw new NotFoundException(`Draft application ${id} not found`);
    }

    return await this.toType(row);
  }

  async update(
    id: string,
    patch: Partial<
      Pick<
        DraftApplicationEntity,
        | "url"
        | "title"
        | "htmlContent"
        | "conversionStatus"
        | "conversionError"
        | "convertedAt"
      >
    >,
  ): Promise<DraftApplicationType> {
    const row = await this.repo.updateById(id, patch);
    if (!row) {
      throw new NotFoundException(`Draft application ${id} not found`);
    }
    return await this.toType(row);
  }

  async delete(
    id: string,
    options?: { deleteLinkedApplication?: boolean; userId?: string },
  ): Promise<void> {
    await this.findOne(id);
    if (options?.deleteLinkedApplication && options.userId) {
      await this.repo.deleteApplicationsByDraftId(id, options.userId);
    }
    await this.repo.deleteById(id);
  }

  async create(
    input: CreateDraftApplicationInput,
  ): Promise<DraftApplicationType> {
    const row = await this.repo.create({
      url: input.url ?? null,
      title: input.title,
      htmlContent: input.htmlContent,
    });

    return await this.toType(row);
  }
}
