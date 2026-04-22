import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "@nestjs/common";
import type { Pool } from "pg";
import { DatabasePoolInterceptor } from "./database-pool.interceptor";
import { DATABASE_POOL_SLOW_QUERY_WARN_MS } from "./request-metrics.constants";
import { RequestMetricsContext } from "./request-metrics.context";

describe("DatabasePoolInterceptor", () => {
  let requestMetrics: RequestMetricsContext;
  let interceptor: DatabasePoolInterceptor;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    requestMetrics = new RequestMetricsContext();
    interceptor = new DatabasePoolInterceptor(requestMetrics);
    warnSpy = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("increments query count when a request-scoped query succeeds", async () => {
    const backend = vi.fn().mockResolvedValue({ rows: [] });
    const pool = { query: backend } as unknown as Pool;
    interceptor.install(pool);

    await requestMetrics.runWithContext(async () => {
      await pool.query("SELECT 1");
      expect(requestMetrics.getQueryCount()).toBe(1);
    });
    expect(backend).toHaveBeenCalledWith("SELECT 1", undefined);
  });

  it("increments query count when a query fails (degraded DB path), and propagates the error", async () => {
    const err = new Error("connection refused");
    const backend = vi.fn().mockReturnValue(Promise.reject(err));
    const pool = { query: backend } as unknown as Pool;
    interceptor.install(pool);

    await requestMetrics.runWithContext(async () => {
      await expect(pool.query("SELECT 1")).rejects.toThrow(
        "connection refused",
      );
      expect(requestMetrics.getQueryCount()).toBe(1);
    });
  });

  it("warns on slow per-query round-trips", async () => {
    const backend = vi.fn().mockResolvedValue({ rows: [] });
    const pool = { query: backend } as unknown as Pool;
    interceptor.install(pool);

    let n = 0;
    const nowSpy = vi.spyOn(performance, "now").mockImplementation(() => {
      n += 1;
      if (n === 1) {
        return 0;
      }
      return DATABASE_POOL_SLOW_QUERY_WARN_MS + 1;
    });

    await requestMetrics.runWithContext(async () => {
      await pool.query("SELECT sleep()");
    });

    expect(warnSpy).toHaveBeenCalled();
    expect(String(warnSpy.mock.calls[0][0])).toContain("slow-query");

    nowSpy.mockRestore();
  });
});
