import type { ConversionMetadataEmbedded } from "@api/database/embeddeds/conversion-metadata.embedded";
import { DraftJobEntity } from "@api/database/entities/draft-job.entity";
import { DraftJobType } from "@api/domains/draft-jobs/draft-job.type";
import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";

import { CreateDraftJobInput } from "./create-draft-job.input";
import { DraftJobsRepository } from "./draft-jobs.repository";

@Injectable()
export class DraftJobsService implements OnModuleInit {
  private readonly logger = new Logger(DraftJobsService.name);

  constructor(private readonly repo: DraftJobsRepository) {}

  async onModuleInit(): Promise<void> {
    const recovered = await this.repo.resetStaleProcessingDrafts();
    if (recovered > 0) {
      this.logger.warn(
        `Recovered ${recovered} stale draft conversion(s) back to idle`,
      );
    }
  }

  async deleteAllLinkedJobs(draftId: string, userId: string): Promise<void> {
    await this.repo.deleteJobsByDraftId(draftId, userId);
  }

  private async toType(row: DraftJobEntity): Promise<DraftJobType> {
    const jobId = await this.repo.findLatestJobIdByDraftId(row.id);
    return {
      id: row.id,
      url: row.url,
      title: row.title,
      htmlContent: row.htmlContent,
      jobId,
      conversionMetadata: row.conversionMetadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(userId: string): Promise<DraftJobType[]> {
    const rows = await this.repo.findAll(userId);
    return Promise.all(rows.map((row) => this.toType(row)));
  }

  async findOne(id: string, userId: string): Promise<DraftJobType> {
    const row = await this.repo.findOne(id, userId);
    if (!row) {
      throw new NotFoundException(`Draft job ${id} not found`);
    }

    return await this.toType(row);
  }

  async update(
    id: string,
    userId: string,
    patch: Partial<Pick<DraftJobEntity, "url" | "title" | "htmlContent">>,
  ): Promise<DraftJobType> {
    const row = await this.repo.updateById(id, userId, patch);
    if (!row) {
      throw new NotFoundException(`Draft job ${id} not found`);
    }
    return await this.toType(row);
  }

  async updateConversionMetadata(
    id: string,
    userId: string,
    expectedStatus: Pick<ConversionMetadataEmbedded, "status"> | null,
    patch: Partial<ConversionMetadataEmbedded> & {
      status: ConversionMetadataEmbedded["status"];
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
    options?: { deleteLinkedJob?: boolean; userId?: string },
  ): Promise<void> {
    const userId = options?.userId;
    if (!userId) {
      throw new NotFoundException(`User ID is required to delete a draft`);
    }
    await this.findOne(id, userId);
    if (options?.deleteLinkedJob) {
      await this.repo.deleteJobsByDraftId(id, userId);
    }
    await this.repo.deleteById(id, userId);
  }

  async create(
    input: CreateDraftJobInput,
    userId: string,
  ): Promise<DraftJobType> {
    const row = await this.repo.create({
      url: input.url ?? null,
      title: input.title,
      htmlContent: input.htmlContent,
      userId,
    });

    return await this.toType(row);
  }
}
