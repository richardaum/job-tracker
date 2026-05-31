import { JobStageEventEntity } from "@api/database/entities/job-stage-event.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager } from "typeorm";
import { Repository } from "typeorm";

import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEvent, NewJobStageEvent } from "./job-stage-events.schema";
import { StageEventSourceEnum } from "./stage-event-source.enum";

export type CreateStageEventRepoDto = {
  toStage: ApplicationStageEnum;
  source?: StageEventSourceEnum;
  fromStage?: ApplicationStageEnum | null;
  reason?: string | null;
  scheduledAt?: Date | null;
};

type UpdateStageEventRepoDto = Pick<NewJobStageEvent, "toStage" | "reason" | "scheduledAt">;

@Injectable()
export class JobStageEventsRepository {
  constructor(
    @InjectRepository(JobStageEventEntity)
    private readonly stageEventsRepo: Repository<JobStageEventEntity>,
  ) {}

  private stageEventRepository(manager?: EntityManager): Repository<JobStageEventEntity> {
    return manager?.getRepository(JobStageEventEntity) ?? this.stageEventsRepo;
  }

  async findStageEventsByJobIdAndUserId(jobId: string, userId: string): Promise<JobStageEvent[]> {
    return this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.job_id = :jobId AND e.user_id = :userId", { jobId, userId })
      .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .getMany();
  }

  async findLatestStageEventByJobIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<JobStageEvent | null> {
    return this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.job_id = :jobId AND e.user_id = :userId", { jobId, userId })
      .orderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .limit(1)
      .getOne();
  }

  /**
   * Latest event per job (order: COALESCE(schedule_at, created_at) desc),
   * one round-trip. Used to expose current stage on `Job` without N+1.
   */
  async findLatestStageSummariesByJobIds(
    userId: string,
    jobIds: string[],
  ): Promise<
    Map<
      string,
      {
        toStage: NewJobStageEvent["toStage"];
        reason: string | null;
        statusAt: Date;
      }
    >
  > {
    const result = new Map<
      string,
      {
        toStage: NewJobStageEvent["toStage"];
        reason: string | null;
        statusAt: Date;
      }
    >();
    if (jobIds.length === 0) {
      return result;
    }
    const events = await this.stageEventsRepo
      .createQueryBuilder("e")
      .where("e.user_id = :userId", { userId })
      .andWhere("e.job_id IN (:...ids)", { ids: jobIds })
      .orderBy("e.job_id", "ASC")
      .addOrderBy("COALESCE(e.schedule_at, e.created_at)", "DESC")
      .addOrderBy("e.created_at", "DESC")
      .addOrderBy("e.id", "DESC")
      .getMany();

    for (const ev of events) {
      if (result.has(ev.jobId)) {
        continue;
      }
      result.set(ev.jobId, {
        toStage: ev.toStage,
        reason: ev.reason,
        statusAt: ev.scheduledAt ?? ev.createdAt,
      });
    }
    return result;
  }

  async findStageEventByIdAndUserId(
    stageEventId: string,
    userId: string,
  ): Promise<JobStageEvent | null> {
    return this.stageEventsRepo.findOne({
      where: { id: stageEventId, userId },
    });
  }

  async createStageEvent(
    userId: string,
    jobId: string,
    dto: CreateStageEventRepoDto,
    manager?: EntityManager,
  ): Promise<JobStageEvent> {
    const events = this.stageEventRepository(manager);
    const row = events.create({
      userId,
      jobId,
      fromStage: dto.fromStage ?? null,
      toStage: dto.toStage,
      source: dto.source ?? StageEventSourceEnum.Manual,
      reason: dto.reason ?? null,
      scheduledAt: dto.scheduledAt ?? null,
    });
    return events.save(row);
  }

  async updateStageEvent(
    stageEventId: string,
    userId: string,
    dto: Partial<UpdateStageEventRepoDto>,
  ): Promise<JobStageEvent | null> {
    const existing = await this.stageEventsRepo.findOne({
      where: { id: stageEventId, userId },
    });
    if (!existing) {
      return null;
    }
    if (dto.toStage !== undefined) {
      existing.toStage = dto.toStage;
    }
    if (dto.scheduledAt !== undefined) {
      existing.scheduledAt = dto.scheduledAt;
    }
    if (dto.reason !== undefined) {
      existing.reason = dto.reason;
    }
    return this.stageEventsRepo.save(existing);
  }

  async deleteStageEvent(stageEventId: string, userId: string): Promise<boolean> {
    const result = await this.stageEventsRepo.delete({
      id: stageEventId,
      userId,
    });
    return (result.affected ?? 0) > 0;
  }
}
