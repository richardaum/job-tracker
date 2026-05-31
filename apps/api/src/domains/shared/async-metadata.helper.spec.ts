import { JobEntity } from "@api/database/entities/job.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import type { Repository } from "typeorm";
import { describe, expect, it, vi } from "vitest";

import {
  beginAsyncMetadataProcessingWhenRestartable,
  resetStaleAsyncMetadataProcessing,
  updateAsyncMetadataIfStatus,
} from "./async-metadata.helper";

function makeQbChain(affected: number) {
  return {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({ affected }),
  };
}

describe("AsyncMetadataHelper", () => {
  const fillColumns = {
    metadataField: "fillMetadata",
    statusColumn: "fill_status",
  };

  it("updateIfStatus matches expected PROCESSING status", async () => {
    const qbChain = makeQbChain(1);
    const jobsRepo = {
      manager: { createQueryBuilder: vi.fn().mockReturnValue(qbChain) },
    } as unknown as Repository<JobEntity>;

    const ok = await updateAsyncMetadataIfStatus(
      JobEntity,
      jobsRepo,
      fillColumns,
      { id: "j1", userId: "u1" },
      AsyncMetadataStatusEnum.PROCESSING,
      { status: AsyncMetadataStatusEnum.COMPLETED },
    );

    expect(ok).toBe(true);
    expect(qbChain.andWhere).toHaveBeenCalledWith(`"fill_status" = :expected`, {
      expected: AsyncMetadataStatusEnum.PROCESSING,
    });
  });

  it("updateIfStatus uses IS NULL when expected status is null", async () => {
    const qbChain = makeQbChain(0);
    const jobsRepo = {
      manager: { createQueryBuilder: vi.fn().mockReturnValue(qbChain) },
    } as unknown as Repository<JobEntity>;

    await updateAsyncMetadataIfStatus(
      JobEntity,
      jobsRepo,
      { metadataField: "summaryMetadata", statusColumn: "summary_status" },
      { id: "j1", userId: "u1" },
      null,
      { status: AsyncMetadataStatusEnum.PROCESSING },
    );

    expect(qbChain.andWhere).toHaveBeenCalledWith(`"summary_status" IS NULL`);
  });

  it("beginProcessingWhenRestartable sets PROCESSING for restartable rows", async () => {
    const qbChain = makeQbChain(1);
    const jobsRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qbChain),
    } as unknown as Repository<JobEntity>;

    await expect(
      beginAsyncMetadataProcessingWhenRestartable(
        JobEntity,
        jobsRepo,
        fillColumns,
        { id: "j1", userId: "u1" },
      ),
    ).resolves.toBe(true);

    expect(qbChain.set).toHaveBeenCalledWith({
      fillMetadata: expect.objectContaining({
        status: AsyncMetadataStatusEnum.PROCESSING,
      }),
    });
  });

  it("resetStaleProcessing marks PROCESSING rows as FAILED", async () => {
    const qbChain = makeQbChain(2);
    const jobsRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qbChain),
    } as unknown as Repository<JobEntity>;

    await expect(
      resetStaleAsyncMetadataProcessing(
        JobEntity,
        jobsRepo,
        fillColumns,
        "Server restart",
      ),
    ).resolves.toBe(2);

    expect(qbChain.where).toHaveBeenCalledWith(`"fill_status" = :processing`, {
      processing: AsyncMetadataStatusEnum.PROCESSING,
    });
  });
});
