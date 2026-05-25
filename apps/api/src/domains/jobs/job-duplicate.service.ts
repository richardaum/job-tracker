import { JobEntity } from "@api/database/entities/job.entity";
import { SettingsService } from "@api/domains/settings/settings.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";

import { ApplicationStageEnum } from "./job-stage.enum";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ResolveInitialStageOnCreateParams = {
  userId: string;
  jobId: string;
  companyId: string;
  title: string | null | undefined;
  referenceTime?: Date;
};

@Injectable()
export class JobDuplicateService {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepo: Repository<JobEntity>,
    private readonly settings: SettingsService,
  ) {}

  async resolveInitialStageOnCreate(
    params: ResolveInitialStageOnCreateParams,
  ): Promise<ApplicationStageEnum.NEW | ApplicationStageEnum.DUPLICATED> {
    const userSettings = await this.settings.getSettings(params.userId);
    const lookbackMs = userSettings.duplicateWindowDays * MS_PER_DAY;
    const referenceTime = params.referenceTime ?? new Date();
    const isDuplicate = await this.hasRecentDuplicateSameRoleAndCompany(
      params.userId,
      params.jobId,
      params.companyId,
      params.title ?? "",
      referenceTime,
      lookbackMs,
    );

    return isDuplicate
      ? ApplicationStageEnum.DUPLICATED
      : ApplicationStageEnum.NEW;
  }

  async hasRecentDuplicateSameRoleAndCompany(
    userId: string,
    excludeJobId: string,
    companyId: string,
    title: string,
    referenceTime: Date,
    lookbackMs: number,
  ): Promise<boolean> {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return false;
    }
    const cutoff = new Date(referenceTime.getTime() - lookbackMs);
    const count = await this.jobsRepo
      .createQueryBuilder("a")
      .where("a.user_id = :userId", { userId })
      .andWhere("a.id != :excludeJobId", { excludeJobId })
      .andWhere("a.company_id = :companyId", { companyId })
      .andWhere("LOWER(TRIM(a.title)) = LOWER(:titleNorm)", {
        titleNorm: trimmedTitle,
      })
      .andWhere("a.created_at >= :cutoff", { cutoff })
      .getCount();
    return count > 0;
  }
}
