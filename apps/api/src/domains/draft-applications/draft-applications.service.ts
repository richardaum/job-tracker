import type { ConversionMetadata } from "@api/database/entities/draft-application.entity";
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
      conversionMetadata: row.conversionMetadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(userId: string): Promise<DraftApplicationType[]> {
    const rows = await this.repo.findAll(userId);
    return Promise.all(rows.map((row) => this.toType(row)));
  }

  async findOne(id: string, userId: string): Promise<DraftApplicationType> {
    const row = await this.repo.findOne(id, userId);
    if (!row) {
      throw new NotFoundException(`Draft application ${id} not found`);
    }

    return await this.toType(row);
  }

  async update(
    id: string,
    userId: string,
    patch: Partial<
      Pick<DraftApplicationEntity, "url" | "title" | "htmlContent">
    >,
  ): Promise<DraftApplicationType> {
    const row = await this.repo.updateById(id, userId, patch);
    if (!row) {
      throw new NotFoundException(`Draft application ${id} not found`);
    }
    return await this.toType(row);
  }

  async updateConversionMetadata(
    id: string,
    userId: string,
    expectedStatus: Pick<ConversionMetadata, "status"> | null,
    patch: Partial<ConversionMetadata> & {
      status: ConversionMetadata["status"];
    },
  ): Promise<boolean> {
    return this.repo.updateConversionMetadata(
      id,
      userId,
      expectedStatus,
      patch,
    );
  }

  async delete(
    id: string,
    options?: { deleteLinkedApplication?: boolean; userId?: string },
  ): Promise<void> {
    const userId = options?.userId;
    if (!userId) {
      throw new NotFoundException(`User ID is required to delete a draft`);
    }
    await this.findOne(id, userId);
    if (options?.deleteLinkedApplication) {
      await this.repo.deleteApplicationsByDraftId(id, userId);
    }
    await this.repo.deleteById(id, userId);
  }

  async create(
    input: CreateDraftApplicationInput,
    userId: string,
  ): Promise<DraftApplicationType> {
    const row = await this.repo.create({
      url: input.url ?? null,
      title: input.title,
      htmlContent: input.htmlContent,
      userId,
    });

    return await this.toType(row);
  }
}
