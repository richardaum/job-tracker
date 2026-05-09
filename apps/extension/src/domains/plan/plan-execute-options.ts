import type { Job } from "@/domains/dom/types";

export type PlanExecuteOptions = {
  /** Called after each job is fully collected (surface + optional detail fields). */
  onJobCollected?: (job: Job) => Promise<void>;
};
