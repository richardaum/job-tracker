import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const REQUIRED_ENV = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/job_tracker_test",
  JWT_ACCESS_SECRET: "test-access-secret",
  JWT_REFRESH_SECRET: "test-refresh-secret",
  GOOGLE_CLIENT_ID: "test-client-id",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
  SETTINGS_ENCRYPTION_KEY: "test-encryption-key-32-bytes-long==",
};

function loadEnv(overrides: Record<string, string | undefined> = {}) {
  process.env = { ...ORIGINAL_ENV, ...REQUIRED_ENV, ...overrides };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    }
  }
  return import("./server");
}

describe("API server env schema", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("loads required values and applies defaults for PORT and WEB_URL", async () => {
    const env = await loadEnv({ PORT: undefined, WEB_URL: undefined });

    expect(env.apiEnv.DATABASE_URL).toBe(REQUIRED_ENV.DATABASE_URL);
    expect(env.apiEnv.PORT).toBe(3101);
    expect(env.apiEnv.WEB_URL).toBe("http://localhost:3100");
  });

  it("rejects non-31xx PORT values in development", async () => {
    await expect(loadEnv({ NODE_ENV: "development", PORT: "4000" })).rejects.toThrow(
      "PORT must stay in the 31xx range for local/test environments.",
    );
  });

  it("allows non-31xx PORT values in production", async () => {
    const env = await loadEnv({ NODE_ENV: "production", PORT: "8080", RATE_LIMIT_DISABLED: undefined });

    expect(env.apiEnv.PORT).toBe(8080);
    expect(env.apiEnv.RATE_LIMIT_DISABLED).toBe(false);
  });

  it("parses JWT_ACCESS_SECRETS JSON when JWT_ACCESS_SECRET is omitted", async () => {
    const env = await loadEnv({
      JWT_ACCESS_SECRET: undefined,
      JWT_ACCESS_SECRETS: JSON.stringify({ current: "json-access-current", previous: "json-access-previous" }),
    });

    expect(env.jwtAccessSecrets).toEqual({ current: "json-access-current", previous: "json-access-previous" });
  });

  it("rejects env when neither JWT_ACCESS_SECRET nor JWT_ACCESS_SECRETS is set", async () => {
    await expect(loadEnv({ JWT_ACCESS_SECRET: undefined, JWT_ACCESS_SECRETS: undefined })).rejects.toThrow(
      "JWT_ACCESS_SECRET or JWT_ACCESS_SECRETS is required.",
    );
  });

  it("parses RATE_LIMIT_DISABLED in development", async () => {
    const env = await loadEnv({ RATE_LIMIT_DISABLED: "true" });

    expect(env.apiEnv.RATE_LIMIT_DISABLED).toBe(true);
  });

  it("rejects RATE_LIMIT_DISABLED in production", async () => {
    await expect(loadEnv({ NODE_ENV: "production", RATE_LIMIT_DISABLED: "true" })).rejects.toThrow(
      "RATE_LIMIT_DISABLED cannot be enabled in production.",
    );
  });

  it("rejects env when SETTINGS_ENCRYPTION_KEY is missing", async () => {
    await expect(loadEnv({ SETTINGS_ENCRYPTION_KEY: undefined })).rejects.toThrow();
  });

  it("exposes SETTINGS_ENCRYPTION_KEY as a string when present", async () => {
    const env = await loadEnv({ SETTINGS_ENCRYPTION_KEY: "test-key-value" });

    expect(env.apiEnv.SETTINGS_ENCRYPTION_KEY).toBe("test-key-value");
  });

  it("defaults TRIAL_AI_CALL_LIMIT to 50 when not set", async () => {
    const env = await loadEnv({ TRIAL_AI_CALL_LIMIT: undefined });

    expect(env.apiEnv.TRIAL_AI_CALL_LIMIT).toBe(50);
  });

  it("parses TRIAL_AI_CALL_LIMIT as a number when set", async () => {
    const env = await loadEnv({ TRIAL_AI_CALL_LIMIT: "100" });

    expect(env.apiEnv.TRIAL_AI_CALL_LIMIT).toBe(100);
  });
});
