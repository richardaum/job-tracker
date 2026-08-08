import type { TourRegistry } from "@/modules/tour/tour.types";

export const WELCOME_TOUR_REGISTRY = {
  "welcome-tour": {
    id: "welcome-tour",
    phases: ["job-creation", "job-details", "job-description", "update-status"],
    dataSources: { job: "local" },
  },
} as const satisfies TourRegistry;
