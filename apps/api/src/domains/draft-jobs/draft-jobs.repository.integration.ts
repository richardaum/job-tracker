/**
 * Legacy integration tests targeted the removed `draft_jobs` table / DraftJobEntity repository.
 * Draft persistence is exercised via JobEntity (`stage === DRAFT`) and migrations — see
 * `1767800000000-integrate-draft-into-jobs.integration.spec.ts`.
 */
import { describe } from "vitest";

describe.skip("DraftJobsRepository integration superseded post draft→jobs merge", () => {});
