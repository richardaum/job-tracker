import { z } from "zod";

const worktreeEnvSchema = z.object({
  WORKTREE_SOURCE_DB: z.string().optional(),
  WORKTREE_POSTGRES_DOCKER: z.string().optional(),
  WORKTREE_POSTGRES_USER: z.string().default("postgres"),
  WORKTREE_DBEAVER_DATA_SOURCES: z.string().optional(),
});

export type WorktreeEnv = z.infer<typeof worktreeEnvSchema>;

export const worktreeEnv = worktreeEnvSchema.parse(process.env);
