import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getApiBaseUrl,
  getGraphqlSseUrl,
  getWebAppLaunchUrl,
  getWebAppUrl,
} from "./api-url";

describe("getApiBaseUrl / getGraphqlSseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to local API port 3101", () => {
    vi.stubEnv("PLASMO_PUBLIC_API_URL", "");
    expect(getApiBaseUrl()).toBe("http://localhost:3101");
    expect(getGraphqlSseUrl()).toBe("http://localhost:3101/stream");
  });

  it("trims trailing slash from env", () => {
    vi.stubEnv("PLASMO_PUBLIC_API_URL", "https://api.example.com/");
    expect(getApiBaseUrl()).toBe("https://api.example.com");
    expect(getGraphqlSseUrl()).toBe("https://api.example.com/stream");
  });
});

describe("getWebAppUrl / getWebAppLaunchUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps localhost API 3101 to web port 3100", () => {
    vi.stubEnv("PLASMO_PUBLIC_WEB_URL", "");
    vi.stubEnv("PLASMO_PUBLIC_API_URL", "http://localhost:3101");
    expect(getWebAppUrl()).toBe("http://localhost:3100");
    expect(getWebAppLaunchUrl()).toBe("http://localhost:3100/");
  });

  it("maps 127.0.0.1 API 3101 to web port 3100", () => {
    vi.stubEnv("PLASMO_PUBLIC_WEB_URL", "");
    vi.stubEnv("PLASMO_PUBLIC_API_URL", "http://127.0.0.1:3101");
    expect(getWebAppUrl()).toBe("http://127.0.0.1:3100");
  });

  it("prefers PLASMO_PUBLIC_WEB_URL over derived default", () => {
    vi.stubEnv("PLASMO_PUBLIC_WEB_URL", "https://app.example/");
    vi.stubEnv("PLASMO_PUBLIC_API_URL", "http://localhost:3101/");
    expect(getWebAppUrl()).toBe("https://app.example");
    expect(getWebAppLaunchUrl()).toBe("https://app.example/");
  });

  it("falls back to localhost:3100 when API is not the local pair", () => {
    vi.stubEnv("PLASMO_PUBLIC_WEB_URL", "");
    vi.stubEnv("PLASMO_PUBLIC_API_URL", "https://api.remote.example/");
    expect(getWebAppUrl()).toBe("http://localhost:3100");
  });
});
