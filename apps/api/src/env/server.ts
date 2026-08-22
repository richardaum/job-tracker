import { config as loadDotenv } from "dotenv";

if (!process.env.DATABASE_URL) {
  loadDotenv();
}

import { z } from "zod";

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
  /** Runtime environment: development, test, or production. */
  NODE_ENV: nodeEnvSchema,
  /** PostgreSQL connection string for the main application database. */
  DATABASE_URL: z.url().startsWith("postgresql://"),
  /** Enables SSL for database connections, required for cloud-hosted PostgreSQL. */
  DATABASE_SSL_ENABLED: z.coerce.boolean().default(false),
  /** Sentry Data Source Name for error monitoring and distributed tracing. */
  SENTRY_DSN: z.url().optional(),
  /** HTTP port the API server binds to, must stay in 31xx for local/test environments. */
  PORT: z.coerce.number().int().min(1).max(65535).default(3101),
  /** Number of trusted reverse-proxy hops for correct client IP resolution via X-Forwarded-For. */
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),
  /** Google OAuth2 client ID for authentication via Google strategy. */
  GOOGLE_CLIENT_ID: z.string(),
  /** Google OAuth2 client secret for authentication via Google strategy. */
  GOOGLE_CLIENT_SECRET: z.string(),
  /** Separate PostgreSQL connection string for integration tests, isolated from the main database. */
  DATABASE_INTEGRATION_URL: z.url().optional(),
  /** Base URL of the web frontend, used for CORS origin validation and OAuth redirects. */
  WEB_URL: z.url().default("http://localhost:3100"),
  /** Secret used exclusively by Better Auth to sign and encrypt its session material. */
  BETTER_AUTH_SECRET: z.string().min(32),
  /** Public API origin used by Better Auth for OAuth callbacks and session cookies. */
  BETTER_AUTH_BASE_URL: z.url(),
  /** OpenAI API key for AI-powered features such as job matching, summaries, and fill generation. */
  OPENAI_API_KEY: z.string().optional(),
  /** OpenAI model identifier for AI features, defaults to gpt-4.1-mini for cost efficiency. */
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  /** Skips Google OAuth flow in dev/E2E, authenticating as DEV_AUTH_BYPASS_EMAIL without credentials. */
  AUTH_BYPASS_ENABLED: z.coerce.boolean().default(false),
  /** Email identity used when auth bypass is enabled, must be set whenever AUTH_BYPASS_ENABLED is true. */
  DEV_AUTH_BYPASS_EMAIL: z.email().optional(),
  /** Dev/E2E only — skips @nestjs/throttler and in-app IP rate limits. */
  RATE_LIMIT_DISABLED: z.preprocess((value) => parseEnvBoolean(value, false), z.boolean()),
  /** Dev only — random delay (300ms–2s) added to every request. */
  SIMULATED_LATENCY_ENABLED: z.preprocess((value) => parseEnvBoolean(value, false), z.boolean()),
  /** Comma-separated CORS origins. Use "*" or omit for all origins (reflect mode). */
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "*") return undefined;
      return val.split(",").map((s) => s.trim());
    }),
  /** AES-256-GCM master key (32 bytes base64-encoded) for encrypting per-user OpenAI API keys at rest. */
  SETTINGS_ENCRYPTION_KEY: z.string(),
  /** Maximum number of AI calls allowed on the shared trial quota per user before requiring a personal key. */
  TRIAL_AI_CALL_LIMIT: z.coerce.number().int().positive().default(50),
  /** PostHog project API key, used to send server-side events and evaluate feature flags. */
  POSTHOG_PROJECT_API_KEY: z.string().optional(),
  /** PostHog personal API key (feature_flags:read scope), enables local flag evaluation without a network round-trip. */
  POSTHOG_PERSONAL_API_KEY: z.string().optional(),
  /** PostHog ingestion host, defaults to US cloud. */
  POSTHOG_HOST: z.url().default("https://us.i.posthog.com"),
  /** Resend API key for transactional email delivery. */
  RESEND_API_KEY: z.string().optional(),
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
  .refine(({ NODE_ENV, RATE_LIMIT_DISABLED }) => NODE_ENV !== "production" || !RATE_LIMIT_DISABLED, {
    message: "RATE_LIMIT_DISABLED cannot be enabled in production.",
    path: ["RATE_LIMIT_DISABLED"],
  })
  .refine(({ NODE_ENV, SIMULATED_LATENCY_ENABLED }) => NODE_ENV !== "production" || !SIMULATED_LATENCY_ENABLED, {
    message: "SIMULATED_LATENCY_ENABLED cannot be enabled in production.",
    path: ["SIMULATED_LATENCY_ENABLED"],
  })
  .parse(process.env);
