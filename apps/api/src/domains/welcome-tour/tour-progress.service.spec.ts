import { UserTourProgressEntity } from "@api/database/entities/user-tour-progress.entity";
import { TourProgressStatusEnum } from "@api/domains/welcome-tour/tour-progress-status.enum";
import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TourProgressRepository } from "./tour-progress.repository";
import { TourProgressService } from "./tour-progress.service";

describe("TourProgressService", () => {
  const repo = { create: vi.fn(), findByUserAndTourId: vi.fn(), save: vi.fn() };

  let service: TourProgressService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [TourProgressService, { provide: TourProgressRepository, useValue: repo }],
    }).compile();
    service = module.get(TourProgressService);
  });

  it("creates an in-progress record at its resumable step", async () => {
    const progress = createProgress();
    repo.findByUserAndTourId.mockResolvedValue(null);
    repo.create.mockReturnValue(progress);
    repo.save.mockResolvedValue(progress);

    await service.save("user-1", {
      tourId: " welcome-tour ",
      tourVersion: 1,
      status: TourProgressStatusEnum.InProgress,
      currentStepId: " job-creation ",
    });

    expect(repo.create).toHaveBeenCalledWith("user-1", {
      tourId: "welcome-tour",
      tourVersion: 1,
      status: TourProgressStatusEnum.InProgress,
      currentStepId: "job-creation",
    });
    expect(progress.completedAt).toBeNull();
    expect(progress.skippedAt).toBeNull();
  });

  it("clears the resumable step and stamps completion", async () => {
    const progress = createProgress({ currentStepId: "status-history" });
    repo.findByUserAndTourId.mockResolvedValue(progress);
    repo.save.mockResolvedValue(progress);

    await service.save("user-1", {
      tourId: "welcome-tour",
      tourVersion: 1,
      status: TourProgressStatusEnum.Completed,
      currentStepId: "status-history",
    });

    expect(progress.currentStepId).toBeNull();
    expect(progress.completedAt).toBeInstanceOf(Date);
    expect(progress.skippedAt).toBeNull();
  });

  it("does not restart a completed or skipped tour", async () => {
    const progress = createProgress({
      status: TourProgressStatusEnum.Completed,
      completedAt: new Date(),
      currentStepId: null,
    });
    repo.findByUserAndTourId.mockResolvedValue(progress);

    await expect(
      service.save("user-1", {
        tourId: "welcome-tour",
        tourVersion: 1,
        status: TourProgressStatusEnum.InProgress,
        currentStepId: "job-creation",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it("allows a newer tour version to restart a completed tour", async () => {
    const progress = createProgress({
      status: TourProgressStatusEnum.Completed,
      tourVersion: 1,
      completedAt: new Date(),
      currentStepId: null,
    });
    repo.findByUserAndTourId.mockResolvedValue(progress);
    repo.save.mockResolvedValue(progress);

    await service.save("user-1", {
      tourId: "welcome-tour",
      tourVersion: 2,
      status: TourProgressStatusEnum.InProgress,
      currentStepId: "job-creation",
    });

    expect(progress.tourVersion).toBe(2);
    expect(progress.status).toBe(TourProgressStatusEnum.InProgress);
    expect(progress.completedAt).toBeNull();
  });

  it("resets a terminal tour to its first step without changing the tour version", async () => {
    const progress = createProgress({
      status: TourProgressStatusEnum.Completed,
      tourVersion: 1,
      completedAt: new Date(),
      currentStepId: null,
    });
    repo.findByUserAndTourId.mockResolvedValue(progress);
    repo.save.mockResolvedValue(progress);

    await service.reset("user-1", { tourId: " welcome-tour ", tourVersion: 1, currentStepId: " job-creation " });

    expect(progress.tourVersion).toBe(1);
    expect(progress.status).toBe(TourProgressStatusEnum.InProgress);
    expect(progress.currentStepId).toBe("job-creation");
    expect(progress.completedAt).toBeNull();
    expect(progress.skippedAt).toBeNull();
  });
});

function createProgress(overrides: Partial<UserTourProgressEntity> = {}): UserTourProgressEntity {
  const progress = new UserTourProgressEntity();
  progress.id = "progress-1";
  progress.userId = "user-1";
  progress.tourId = "welcome-tour";
  progress.tourVersion = 1;
  progress.status = TourProgressStatusEnum.InProgress;
  progress.currentStepId = "job-creation";
  progress.completedAt = null;
  progress.skippedAt = null;
  progress.createdAt = new Date();
  progress.updatedAt = new Date();
  Object.assign(progress, overrides);
  return progress;
}
