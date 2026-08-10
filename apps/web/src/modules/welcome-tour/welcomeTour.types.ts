export const WELCOME_TOUR_PHASES = [
  "job-creation",
  "job-details",
  "job-description",
  "update-status",
  "status-history",
] as const;

export type WelcomeTourPhase = (typeof WELCOME_TOUR_PHASES)[number];
