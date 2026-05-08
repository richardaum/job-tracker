import { ImportRunEntity } from "@api/database/entities/import-run.entity";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ImportsRepository {
  constructor(
    @InjectRepository(ImportRunEntity)
    private readonly runsRepo: Repository<ImportRunEntity>,
  ) {}

  async listByUserId(userId: string): Promise<ImportRunEntity[]> {
    return this.runsRepo.find({
      where: { userId },
      order: { startedAt: "DESC", id: "DESC" },
    });
  }

  async create(params: {
    userId: string;
    importerId: string;
    importerName: string;
    entryUrl: string;
    status: ImportRunStatusEnum;
    startedAt: Date;
  }): Promise<ImportRunEntity> {
    const row = this.runsRepo.create({
      userId: params.userId,
      importerId: params.importerId,
      importerName: params.importerName,
      entryUrl: params.entryUrl,
      status: params.status,
      startedAt: params.startedAt,
    });
    return this.runsRepo.save(row);
  }

  async deleteByUser(params: { id: string; userId: string }): Promise<boolean> {
    const result = await this.runsRepo.delete({
      id: params.id,
      userId: params.userId,
    });
    return (result.affected ?? 0) > 0;
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await this.runsRepo.delete({ userId });
    return result.affected ?? 0;
  }

  async findByUserAndId(params: {
    id: string;
    userId: string;
  }): Promise<ImportRunEntity | null> {
    return this.runsRepo.findOne({
      where: { id: params.id, userId: params.userId },
    });
  }

  async updateStatus(params: {
    id: string;
    userId: string;
    status: ImportRunStatusEnum;
  }): Promise<boolean> {
    const result = await this.runsRepo.update(
      { id: params.id, userId: params.userId },
      { status: params.status },
    );
    return (result.affected ?? 0) > 0;
  }

  async resetStaleInProgressRuns(cutoff: Date): Promise<number> {
    const result = await this.runsRepo
      .createQueryBuilder()
      .update(ImportRunEntity)
      .set({ status: ImportRunStatusEnum.RUNNING })
      .where("status = :status", { status: ImportRunStatusEnum.IN_PROGRESS })
      .andWhere("started_at < :cutoff", { cutoff: cutoff.toISOString() })
      .execute();

    return result.affected ?? 0;
  }

  /**
   * Atomic compare-and-swap claim: transitions a run from RUNNING -> IN_PROGRESS
   * in a single SQL statement (UPDATE ... WHERE status = 'running' RETURNING *).
   * Returns the updated entity on win, or null on contention / wrong status / missing row.
   */
  async claimRunning(params: {
    id: string;
    userId: string;
  }): Promise<ImportRunEntity | null> {
    const result = await this.runsRepo
      .createQueryBuilder()
      .update(ImportRunEntity)
      .set({ status: ImportRunStatusEnum.IN_PROGRESS })
      .where("id = :id AND user_id = :userId AND status = :runningStatus", {
        id: params.id,
        userId: params.userId,
        runningStatus: ImportRunStatusEnum.RUNNING,
      })
      .returning("*")
      .execute();

    const raw = (result.raw as Record<string, unknown>[] | undefined)?.[0];
    if (!raw) {
      return null;
    }
    return {
      id: raw.id as string,
      userId: raw.user_id as string,
      importerId: raw.importer_id as string,
      importerName: raw.importer_name as string,
      entryUrl: raw.entry_url as string,
      status: raw.status as ImportRunStatusEnum,
      startedAt: new Date(raw.started_at as string | Date),
    };
  }
}
