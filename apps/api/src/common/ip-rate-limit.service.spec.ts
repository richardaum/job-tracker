import { describe, expect, it } from "vitest";

import { IpRateLimitService } from "./ip-rate-limit.service";

describe("IpRateLimitService", () => {
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
});
