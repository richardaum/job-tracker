import type { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";

export type ApplicationStageEvent = Omit<ApplicationStageEventEntity, "setId">;

export type NewApplicationStageEvent = Pick<
  ApplicationStageEventEntity,
  "applicationId" | "userId" | "fromStage" | "toStage"
> & {
  source?: string;
  scheduledAt?: Date | null;
};
