import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { normalizeMatchAnalysisEntity } from "./normalize-match-items.util";

@Injectable()
export class MatchAnalysisRepository {
  constructor(
    @InjectRepository(MatchAnalysisEntity)
    private readonly repo: Repository<MatchAnalysisEntity>,
  ) {}

  async findById(id: string, userId?: string): Promise<MatchAnalysisEntity | null> {
    const entity = await this.repo.findOne({ where: { id, ...(userId ? { userId } : {}) } });
    return normalizeMatchAnalysisEntity(entity);
  }

  async findByJobId(jobId: string, userId?: string): Promise<MatchAnalysisEntity | null> {
    const entity = await this.repo.findOne({ where: { jobId, ...(userId ? { userId } : {}) } });
    return normalizeMatchAnalysisEntity(entity);
  }

  async findAllByUserId(userId: string): Promise<MatchAnalysisEntity[]> {
    const entities = await this.repo.find({ where: { userId }, order: { updatedAt: "DESC" } });
    return entities.map((entity) => normalizeMatchAnalysisEntity(entity)!);
  }

  async upsert(entity: MatchAnalysisEntity): Promise<MatchAnalysisEntity> {
    const existing = await this.findByJobId(entity.jobId, entity.userId ?? undefined);

    if (existing) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      return this.repo.save(entity);
    }
    return this.repo.save(entity);
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByApplicationId(jobId: string, userId?: string): Promise<boolean> {
    const result = await this.repo.delete({ jobId, ...(userId ? { userId } : {}) });
    return (result.affected ?? 0) > 0;
  }

  async updateById(
    id: string,
    expectedStatus: AsyncMetadataStatusEnum,
    patch: Partial<MatchAnalysisEntity>,
    userId?: string,
  ): Promise<MatchAnalysisEntity | null> {
    const qb = this.repo
      .createQueryBuilder("f")
      .where("f.id = :id AND f.generation_status = :expectedStatus", { id, expectedStatus });
    if (userId) {
      qb.andWhere("f.user_id = :userId", { userId });
    }
    const entity = await qb.getOne();
    if (!entity) return null;
    Object.assign(entity, patch);
    return this.repo.save(entity);
  }

  async resetStaleProcessing(): Promise<number> {
    const stale = await this.repo
      .createQueryBuilder("f")
      .where("f.generation_status = :status", { status: AsyncMetadataStatusEnum.PROCESSING })
      .getMany();
    for (const entity of stale) {
      entity.generationMetadata = {
        status: AsyncMetadataStatusEnum.FAILED,
        error: "Analysis interrupted and reset to failed after server restart.",
        timestamp: new Date(),
      };
    }
    if (stale.length > 0) {
      await this.repo.save(stale);
    }
    return stale.length;
  }
}
