import "dotenv/config";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  SENTRY_DSN: z.string().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3101),
});

const validated = serverEnvSchema.parse(process.env);

export const { DATABASE_URL, SENTRY_DSN, PORT } = validated;
