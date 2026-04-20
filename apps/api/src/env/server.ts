import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  SENTRY_DSN: z.string().optional(),
});

const validated = serverEnvSchema.parse(process.env);

export const { DATABASE_URL, SENTRY_DSN } = validated;
