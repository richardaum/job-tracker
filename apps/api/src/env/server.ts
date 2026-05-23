import { config as loadDotenv } from "dotenv";

if (!process.env.DATABASE_URL) {
  loadDotenv();
}

import { z } from "zod";

const nodeEnvSchema = z
  .enum(["development", "test", "production"])
  .default("development");

const serverEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  DATABASE_URL: z.url().startsWith("postgresql://"),
  SENTRY_DSN: z.url().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3101),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z
    .url()
    .default("http://localhost:3101/auth/google/callback"),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  DATABASE_INTEGRATION_URL: z.url().optional(),
  WEB_URL: z.url().default("http://localhost:3100"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  AUTH_BYPASS_ENABLED: z.coerce.boolean().default(false),
  DEV_AUTH_BYPASS_EMAIL: z.email().default("richard.lopes92@gmail.com"),
});

export const serverEnv = serverEnvSchema
  .refine(
    ({ NODE_ENV, PORT }) =>
      NODE_ENV === "production" || (PORT >= 3100 && PORT <= 3199),
    {
      message: "PORT must stay in the 31xx range for local/test environments.",
      path: ["PORT"],
    },
  )
  .parse(process.env);
