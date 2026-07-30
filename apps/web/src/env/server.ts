import "server-only";

import { z } from "zod";

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3100),
    NEXT_PUBLIC_API_URL: z.url(),
    /** PostHog personal API key (feature_flags:read scope), enables local flag evaluation in server components/middleware. */
    POSTHOG_PERSONAL_API_KEY: z.string().optional(),
  })
  .refine(({ NODE_ENV, PORT }) => NODE_ENV === "production" || (PORT >= 3100 && PORT <= 3199), {
    message: "PORT must stay in the 31xx range for local/test environments.",
    path: ["PORT"],
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = serverEnvSchema.parse(process.env);
