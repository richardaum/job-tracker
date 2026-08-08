import type { JobPersistenceMode } from "@/modules/jobs/shared/types/jobPersistenceMode";

export type TourId = "welcome-tour";

export type TourDefinition = { id: TourId; dataSources?: { job?: JobPersistenceMode } };

export const TOUR_DEFINITIONS: Record<TourId, TourDefinition> = {
  "welcome-tour": { id: "welcome-tour", dataSources: { job: "local" } },
};
