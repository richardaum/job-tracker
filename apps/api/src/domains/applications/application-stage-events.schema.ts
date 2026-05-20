import type { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";

import type { StageEventSourceEnum } from "./stage-event-source.enum";

export type ApplicationStageEvent = Omit<ApplicationStageEventEntity, "setId">;

export type NewApplicationStageEvent = Pick<
  ApplicationStageEventEntity,
  "applicationId" | "userId" | "fromStage" | "toStage"
> & {
  source?: StageEventSourceEnum;
  reason?: string | null;
  scheduledAt?: Date | null;
};
