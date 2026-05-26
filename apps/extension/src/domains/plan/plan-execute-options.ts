import type { Job } from "@/domains/dom/types";

export type PlanExecuteOptions = {
  /** Listing page URL for the collect.jobs step (provided by the execution context). */
  surfaceUrl: string;
  /** Called after each job is fully collected (surface + optional detail fields). */
  onJobCollected?: (job: Job) => Promise<void>;
};
