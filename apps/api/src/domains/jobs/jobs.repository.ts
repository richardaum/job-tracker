import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import { JobEntity } from "@api/database/entities/job.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager } from "typeorm";
import { Repository } from "typeorm";

import { ApplicationStageEnum } from "./job-stage.enum";
import { Job, NewJob } from "./jobs.schema";

export type CreateJobRepoDto = Pick<
  NewJob,
  | "title"
  | "companyId"
  | "description"
  | "urls"
  | "source"
  | "tags"
  | "location"
  | "workRegion"
> & {
  salary?: SalaryEmbedded;
  draftJobId?: string | null;
  sourceRunId?: string | null;
  htmlContent?: string | null;
};
export type UpdateJobRepoDto = Partial<CreateJobRepoDto>;

@Injectable()
export class JobsRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepo: Repository<JobEntity>,
  ) {}

  private jobRepository(manager?: EntityManager): Repository<JobEntity> {
    return manager?.getRepository(JobEntity) ?? this.jobsRepo;
  }

  async findOneByIdAndUserId(
    id: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<Job | null> {
    return this.jobRepository(manager).findOne({
      where: { id, userId },
      relations: ["company"],
    });
  }

  async saveJob(job: Job, manager?: EntityManager): Promise<Job> {
    return this.jobRepository(manager).save(job);
  }

  /**
   * Keep denormalized `jobs.stage` aligned with the canonical initial pipeline stage (before/for the
   * first system stage event). Required when converting a DRAFT row via `create` + reused PK: plain
   * `save()` would leave stale `stage = DRAFT` despite `NEW`/`DUPLICATED` events.
   */
  async setPersistedStage(
    userId: string,
    jobId: string,
    stage: ApplicationStageEnum,
  ): Promise<void> {
    await this.jobsRepo.update({ id: jobId, userId }, { stage });
  }

  async create(userId: string, dto: CreateJobRepoDto): Promise<Job> {
    const { draftJobId, sourceRunId, ...rest } = dto;
    const draftPk =
      typeof draftJobId === "string" && draftJobId.trim().length > 0
        ? draftJobId.trim()
        : null;
    const row = this.jobsRepo.create({
      userId,
      ...rest,
      sourceRunId: sourceRunId ?? null,
      ...(draftPk ? { id: draftPk } : {}),
    });
    return this.jobsRepo.save(row);
  }

  async detachJobsSourceRun(
    sourceRunId: string,
    userId: string,
  ): Promise<number> {
    const result = await this.jobsRepo.update(
      { userId, sourceRunId },
      { sourceRunId: null },
    );
    return result.affected ?? 0;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateJobRepoDto,
  ): Promise<Job | null> {
    const existing = await this.findOneByIdAndUserId(id, userId);
    if (!existing) {
      return null;
    }
    Object.assign(existing, dto);
    return this.jobsRepo.save(existing);
  }

  async delete(id: string, userId: string): Promise<Job | null> {
    const existing = await this.findOneByIdAndUserId(id, userId);
    if (!existing) {
      return null;
    }
    await this.jobsRepo.delete({ id, userId });
    return existing;
  }

  async updateSummary(
    jobId: string,
    summary: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.jobsRepo.update(
      { id: jobId, userId },
      { summary },
    );
    return (result.affected ?? 0) > 0;
  }
}
