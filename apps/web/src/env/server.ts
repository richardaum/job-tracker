import "server-only";

import { z } from "zod";

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3100),
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_DEPLOYED_AT: z.iso.datetime().optional(),
    VERCEL_DEPLOYMENT_ID: z.string().optional(),
    VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  })
  .refine(({ NODE_ENV, PORT }) => NODE_ENV === "production" || (PORT >= 3100 && PORT <= 3199), {
    message: "PORT must stay in the 31xx range for local/test environments.",
    path: ["PORT"],
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = serverEnvSchema.parse(process.env);
