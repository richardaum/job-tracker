import type { Job } from "@/domains/dom/types";
import { StopWhen } from "@/gql/graphql";

export type PlanExecuteOptions = {
  /** Listing page URL for the collect.jobs step (provided by the execution context). */
  surfaceUrl: string;
  /** Called after each job is fully collected (surface + optional detail fields). */
  onJobCollected?: (job: Job) => Promise<{ duplicate: boolean } | void>;
  /** Called after each page is collected (one iteration of the collect loop). */
  onPageCollected?: (page: number, jobCount: number) => Promise<void> | void;
  /** Called when a stop condition is met and the collect loop will break. */
  onStopConditionMet?: (page: number, reason: string) => Promise<void> | void;
  /** Board type: Sequential jobs appear in chronological order, NonSequential do not. */
  boardType: "Sequential" | "NonSequential";
  /** Stop condition strategy (from template config). Single value or array. */
  stopWhen?: StopWhen | StopWhen[];
  /** Consecutive duplicates threshold for CatchUp stop condition. */
  catchUpThreshold?: number;
  /** Max pages for FirstRunMaxPages stop condition. */
  maxPages?: number;
  /** Job age threshold in days for OlderThan stop condition. */
  olderThanDays?: number;
  /** Name of the surface field holding publish date (required for OlderThan). */
  publishedAtField?: string;
};
