import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const REQUIRED_ENV = {
  DATABASE_URL:
    "postgresql://postgres:postgres@localhost:5432/job_tracker_test",
  JWT_ACCESS_SECRET: "test-access-secret",
  JWT_REFRESH_SECRET: "test-refresh-secret",
  GOOGLE_CLIENT_ID: "test-client-id",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
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

    expect(env.DATABASE_URL).toBe(REQUIRED_ENV.DATABASE_URL);
    expect(env.PORT).toBe(3101);
    expect(env.WEB_URL).toBe("http://localhost:3100");
  });

  it("rejects non-31xx PORT values in development", async () => {
    await expect(
      loadEnv({ NODE_ENV: "development", PORT: "4000" }),
    ).rejects.toThrow(
      "PORT must stay in the 31xx range for local/test environments.",
    );
  });

  it("allows non-31xx PORT values in production", async () => {
    const env = await loadEnv({ NODE_ENV: "production", PORT: "8080" });

    expect(env.PORT).toBe(8080);
  });
});
