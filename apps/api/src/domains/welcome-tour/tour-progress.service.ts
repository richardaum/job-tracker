import { TourProgressStatusEnum } from "@api/domains/welcome-tour/tour-progress-status.enum";
import { BadRequestException, Injectable } from "@nestjs/common";

import type { ResetTourProgressDto, SaveTourProgressDto, TourProgress } from "./tour-progress.schema";
import { TourProgressRepository } from "./tour-progress.repository";

@Injectable()
export class TourProgressService {
  constructor(private readonly repo: TourProgressRepository) {}

  async findByUserAndTourId(userId: string, tourId: string): Promise<TourProgress | null> {
    return this.repo.findByUserAndTourId(userId, tourId);
  }

  async save(userId: string, dto: SaveTourProgressDto): Promise<TourProgress> {
    const progressDto = normalizeProgressDto(dto);
    const existing = await this.repo.findByUserAndTourId(userId, progressDto.tourId);

    if (existing && existing.tourVersion > progressDto.tourVersion) {
      return existing;
    }

    if (existing && existing.tourVersion === progressDto.tourVersion && isTerminalStatus(existing.status)) {
      if (existing.status !== progressDto.status) {
        throw new BadRequestException(`Tour ${progressDto.tourId} has already ended.`);
      }
      return existing;
    }

    const progress = existing ?? this.repo.create(userId, progressDto);
    return this.persistProgress(progress, progressDto);
  }

  async reset(userId: string, dto: ResetTourProgressDto): Promise<TourProgress> {
    const progressDto = normalizeProgressDto({ ...dto, status: TourProgressStatusEnum.InProgress });
    const existing = await this.repo.findByUserAndTourId(userId, progressDto.tourId);
    const progress = existing ?? this.repo.create(userId, progressDto);

    return this.persistProgress(progress, progressDto);
  }

  private persistProgress(progress: TourProgress, progressDto: SaveTourProgressDto): Promise<TourProgress> {
    progress.tourVersion = progressDto.tourVersion;
    progress.status = progressDto.status;
    progress.currentStepId = progressDto.currentStepId ?? null;

    if (progressDto.status === TourProgressStatusEnum.Completed) {
      progress.completedAt = new Date();
      progress.skippedAt = null;
    } else if (progressDto.status === TourProgressStatusEnum.Skipped) {
      progress.completedAt = null;
      progress.skippedAt = new Date();
    } else {
      progress.completedAt = null;
      progress.skippedAt = null;
    }

    return this.repo.save(progress);
  }
}

function normalizeProgressDto(dto: SaveTourProgressDto): SaveTourProgressDto {
  const tourId = dto.tourId.trim();
  if (!tourId) {
    throw new BadRequestException("tourId cannot be empty.");
  }

  if (dto.status !== TourProgressStatusEnum.InProgress) {
    return { ...dto, tourId, currentStepId: null };
  }

  const currentStepId = dto.currentStepId?.trim() ?? null;
  if (!currentStepId) {
    throw new BadRequestException("currentStepId is required while a tour is in progress.");
  }

  return { ...dto, tourId, currentStepId };
}

function isTerminalStatus(status: TourProgressStatusEnum): boolean {
  return status === TourProgressStatusEnum.Completed || status === TourProgressStatusEnum.Skipped;
}
