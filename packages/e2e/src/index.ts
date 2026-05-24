/**
 * E2E environment configuration — single source of truth for setup/teardown scripts.
 * Overrideable via env vars. Follows the same zod pattern as clientEnv, serverEnv, worktreeEnv.
 */

import { z } from "zod";

const e2eEnvSchema = z.object({
  E2E_DB_NAME: z.string().min(1).default("job_tracker_e2e"),
  E2E_API_PORT: z.coerce.number().int().min(1024).max(65535).default(3199),
  E2E_WEB_PORT: z.coerce.number().int().min(1024).max(65535).default(3200),
  E2E_BYPASS_EMAIL: z.email().default("e2e@jobtracker.com"),
});

export const e2eEnv = e2eEnvSchema.parse(process.env);
