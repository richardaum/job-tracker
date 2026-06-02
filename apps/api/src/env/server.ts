import { config as loadDotenv } from "dotenv";

if (!process.env.DATABASE_URL) {
  loadDotenv();
}

import { z } from "zod";

import { parseJwtSecretPair } from "./jwt-secrets";

const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

function parseEnvBoolean(value: unknown, defaultValue = false): boolean {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value === "true" || value === "1";
  }
  return defaultValue;
}

const apiEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  DATABASE_URL: z.url().startsWith("postgresql://"),
  SENTRY_DSN: z.url().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3101),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.url().default("http://localhost:3101/auth/google/callback"),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_ACCESS_SECRETS: z.string().optional(),
  JWT_REFRESH_SECRETS: z.string().optional(),
  DATABASE_INTEGRATION_URL: z.url().optional(),
  WEB_URL: z.url().default("http://localhost:3100"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  AUTH_BYPASS_ENABLED: z.coerce.boolean().default(false),
  DEV_AUTH_BYPASS_EMAIL: z.email().optional(),
  /** Dev/E2E only — skips @nestjs/throttler and in-app IP rate limits. */
  RATE_LIMIT_DISABLED: z.preprocess((value) => parseEnvBoolean(value, false), z.boolean()),

  /** Dev only — random delay (300ms–2s) added to every request. */
  SIMULATED_LATENCY_ENABLED: z.preprocess((value) => parseEnvBoolean(value, false), z.boolean()),
});

export const apiEnv = apiEnvSchema
  .refine(({ NODE_ENV, PORT }) => NODE_ENV === "production" || (PORT >= 3100 && PORT <= 3199), {
    message: "PORT must stay in the 31xx range for local/test environments.",
    path: ["PORT"],
  })
  .refine(
    ({ AUTH_BYPASS_ENABLED, DEV_AUTH_BYPASS_EMAIL }) => !AUTH_BYPASS_ENABLED || DEV_AUTH_BYPASS_EMAIL !== undefined,
    { message: "DEV_AUTH_BYPASS_EMAIL is required when AUTH_BYPASS_ENABLED is true.", path: ["DEV_AUTH_BYPASS_EMAIL"] },
  )
  .refine(
    ({ JWT_ACCESS_SECRET, JWT_ACCESS_SECRETS }) => JWT_ACCESS_SECRETS !== undefined || JWT_ACCESS_SECRET !== undefined,
    { message: "JWT_ACCESS_SECRET or JWT_ACCESS_SECRETS is required.", path: ["JWT_ACCESS_SECRET"] },
  )
  .refine(
    ({ JWT_REFRESH_SECRET, JWT_REFRESH_SECRETS }) =>
      JWT_REFRESH_SECRETS !== undefined || JWT_REFRESH_SECRET !== undefined,
    { message: "JWT_REFRESH_SECRET or JWT_REFRESH_SECRETS is required.", path: ["JWT_REFRESH_SECRET"] },
  )
  .refine(({ NODE_ENV, RATE_LIMIT_DISABLED }) => NODE_ENV !== "production" || !RATE_LIMIT_DISABLED, {
    message: "RATE_LIMIT_DISABLED cannot be enabled in production.",
    path: ["RATE_LIMIT_DISABLED"],
  })
  .refine(({ NODE_ENV, SIMULATED_LATENCY_ENABLED }) => NODE_ENV !== "production" || !SIMULATED_LATENCY_ENABLED, {
    message: "SIMULATED_LATENCY_ENABLED cannot be enabled in production.",
    path: ["SIMULATED_LATENCY_ENABLED"],
  })
  .parse(process.env);

export const jwtAccessSecrets = parseJwtSecretPair(apiEnv.JWT_ACCESS_SECRETS, apiEnv.JWT_ACCESS_SECRET);

export const jwtRefreshSecrets = parseJwtSecretPair(apiEnv.JWT_REFRESH_SECRETS, apiEnv.JWT_REFRESH_SECRET);
