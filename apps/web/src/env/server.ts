import "server-only";
import { z } from "zod";

/** Extend with required server-only variables (auth secrets, API keys, etc.). */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3100),
  /** Used by server-only fetches (e.g. generateMetadata) and shared with the client bundle. */
  NEXT_PUBLIC_API_GRAPHQL_URL: z.url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const validated = serverEnvSchema
  .refine(
    ({ NODE_ENV, PORT }) =>
      NODE_ENV === "production" || (PORT >= 3100 && PORT <= 3199),
    {
      message: "PORT must stay in the 31xx range for local/test environments.",
      path: ["PORT"],
    },
  )
  .parse(process.env);
export const serverEnv = validated;
