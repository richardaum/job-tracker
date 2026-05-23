import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { tryRun } from "@job-tracker/try-run";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import type { DataSource } from "typeorm";

import { JobAsyncMetadataRepository } from "./job-async-metadata.repository";
import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEventsRepository } from "./job-stage-events.repository";
import { JobsRepository, UpdateJobRepoDto } from "./jobs.repository";
import { StageEventSourceEnum } from "./stage-event-source.enum";

class FillCompletionCasMismatchError extends Error {
  constructor() {
    super("Automatic fill finalize CAS missed PROCESSING precondition.");
    this.name = "FillCompletionCasMismatchError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type FinalizeExtractedFillResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "cas_mismatch" };

@Injectable()
export class JobFillPersistence {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly repo: JobsRepository,
    private readonly stageEventsRepo: JobStageEventsRepository,
    private readonly asyncMetadataRepo: JobAsyncMetadataRepository,
  ) {}

  /**
   * Atomically persists AI extraction, optionally promotes DRAFT → NEW with a stage event,
   * then CAS-completes fill metadata. Rolls back all writes on CAS mismatch.
   * Promotion intent is decided by {@link JobsService} — this method only executes it.
   */
  async finalizeExtractedFill(
    jobId: string,
    userId: string,
    dto: UpdateJobRepoDto,
    shouldPromoteDraftToNew: boolean,
  ): Promise<FinalizeExtractedFillResult> {
    const [err, result] = await tryRun(
      this.dataSource.transaction(async (manager) => {
        const existing = await this.repo.findOneByIdAndUserId(
          jobId,
          userId,
          manager,
        );
        if (!existing) {
          return { ok: false as const, reason: "not_found" as const };
        }

        Object.assign(existing, dto);
        if (shouldPromoteDraftToNew) {
          existing.stage = ApplicationStageEnum.NEW;
        }
        await this.repo.saveJob(existing, manager);

        if (shouldPromoteDraftToNew) {
          await this.stageEventsRepo.createStageEvent(
            userId,
            jobId,
            {
              fromStage: ApplicationStageEnum.DRAFT,
              toStage: ApplicationStageEnum.NEW,
              source: StageEventSourceEnum.System,
            },
            manager,
          );
        }

        const completed = await this.asyncMetadataRepo.updateCas(
          "fill",
          jobId,
          userId,
          { status: AsyncMetadataStatusEnum.PROCESSING },
          {
            status: AsyncMetadataStatusEnum.COMPLETED,
            timestamp: new Date(),
            error: null,
          },
          manager,
        );
        if (!completed) {
          throw new FillCompletionCasMismatchError();
        }

        return { ok: true as const };
      }),
    );

    if (err instanceof FillCompletionCasMismatchError) {
      return { ok: false, reason: "cas_mismatch" };
    }
    if (err != null) {
      throw err;
    }

    return result;
  }
}
