import { afterEach, describe, expect, it, vi } from "vitest";

const mockApiEnv = vi.hoisted(() => ({ RATE_LIMIT_DISABLED: false }));

vi.mock("@api/env/server", () => ({ apiEnv: mockApiEnv }));

import { IpRateLimitService } from "./ip-rate-limit.service";

describe("IpRateLimitService", () => {
  afterEach(() => {
    mockApiEnv.RATE_LIMIT_DISABLED = false;
  });

  it("allows requests up to the limit within the TTL window", () => {
    const service = new IpRateLimitService();

    expect(service.consume("1.2.3.4", 3, 60_000)).toBe(true);
    expect(service.consume("1.2.3.4", 3, 60_000)).toBe(true);
    expect(service.consume("1.2.3.4", 3, 60_000)).toBe(true);
    expect(service.consume("1.2.3.4", 3, 60_000)).toBe(false);
  });

  it("tracks limits independently per key", () => {
    const service = new IpRateLimitService();

    expect(service.consume("1.2.3.4", 1, 60_000)).toBe(true);
    expect(service.consume("1.2.3.4", 1, 60_000)).toBe(false);
    expect(service.consume("5.6.7.8", 1, 60_000)).toBe(true);
  });

  it("always allows when RATE_LIMIT_DISABLED is true", () => {
    mockApiEnv.RATE_LIMIT_DISABLED = true;
    const service = new IpRateLimitService();

    for (let i = 0; i < 10; i++) {
      expect(service.consume("1.2.3.4", 1, 60_000)).toBe(true);
    }
  });
});
