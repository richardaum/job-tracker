import {
  FitAnalysisEntity,
  FitAnalysisStatus,
} from "@api/database/entities/fit-analysis.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class FitAnalysisRepository {
  constructor(
    @InjectRepository(FitAnalysisEntity)
    private readonly repo: Repository<FitAnalysisEntity>,
  ) {}

  async findByApplicationId(
    applicationId: string,
  ): Promise<FitAnalysisEntity | null> {
    return this.repo.findOne({ where: { applicationId } });
  }

  async upsert(entity: FitAnalysisEntity): Promise<FitAnalysisEntity> {
    const existing = await this.findByApplicationId(entity.applicationId);
    if (existing) {
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      return this.repo.save(entity);
    }
    return this.repo.save(entity);
  }

  async deleteByApplicationId(applicationId: string): Promise<boolean> {
    const result = await this.repo.delete({ applicationId });
    return (result.affected ?? 0) > 0;
  }

  async updateStatus(
    applicationId: string,
    expectedStatus: FitAnalysisStatus,
    patch: Partial<FitAnalysisEntity>,
  ): Promise<boolean> {
    const result = await this.repo.update(
      { applicationId, status: expectedStatus },
      patch,
    );
    return (result.affected ?? 0) > 0;
  }

  async resetStaleProcessing(): Promise<number> {
    const result = await this.repo.update(
      { status: FitAnalysisStatus.PROCESSING },
      {
        status: FitAnalysisStatus.FAILED,
        error: "Analysis interrupted and reset to failed after server restart.",
      },
    );
    return result.affected ?? 0;
  }
}
