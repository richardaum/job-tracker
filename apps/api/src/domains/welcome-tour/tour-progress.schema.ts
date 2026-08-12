import type { UserTourProgressEntity } from "@api/database/entities/user-tour-progress.entity";

export type TourProgress = UserTourProgressEntity;

export type SaveTourProgressDto = Pick<UserTourProgressEntity, "tourId" | "tourVersion" | "status"> & {
  currentStepId?: string | null;
};
