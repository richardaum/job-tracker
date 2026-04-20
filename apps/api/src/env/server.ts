import "dotenv/config";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  SENTRY_DSN: z.string().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3101),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z
    .url()
    .default("http://localhost:3101/auth/google/callback"),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  WEB_URL: z.url().default("http://localhost:3100"),
});

const validated = serverEnvSchema.parse(process.env);

export const {
  DATABASE_URL,
  SENTRY_DSN,
  PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  WEB_URL,
} = validated;
