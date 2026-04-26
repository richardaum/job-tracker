import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";
import { DatabasePoolInterceptor } from "./database-pool.interceptor";
import { DATABASE_POOL_SLOW_QUERY_WARN_MS } from "./request-metrics.constants";
import { RequestMetricsContext } from "./request-metrics.context";

function createPooledClientMock(
  queryImpl: (...a: unknown[]) => ReturnType<PoolClient["query"]>,
) {
  return {
    query: vi.fn((...a: unknown[]) =>
      queryImpl(...a),
    ) as unknown as PoolClient["query"],
    release: vi.fn(),
  } as unknown as PoolClient;
}

/** Same shape as `pg-pool`: `connect` + `client.query` with callback (no `pool.query` hop). */
function mockPoolQuery(
  pool: { connect: Pool["connect"] },
  text: string,
  values: unknown = undefined,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    void pool.connect((err, client) => {
      if (err || !client) {
        reject(err);
        return;
      }
      if (values === undefined) {
        client.query(text, (e, res) => {
          (client as PoolClient & { release: () => void }).release();
          if (e) {
            reject(e);
          } else {
            resolve(res);
          }
        });
      } else {
        client.query(text, values as never, (e: Error, res: unknown) => {
          (client as PoolClient & { release: () => void }).release();
          if (e) {
            reject(e);
          } else {
            resolve(res);
          }
        });
      }
    });
  });
}

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

  it("increments query count for connect + client.query (promise) path", async () => {
    const backend = vi.fn().mockResolvedValue({ rows: [] });
    const client = createPooledClientMock((text) => backend(text as string));
    const pool = {
      connect(
        callback?: (
          err: Error | undefined,
          c: PoolClient | undefined,
          r: (e?: Error | boolean) => void,
        ) => void,
      ): void | Promise<PoolClient> {
        if (typeof callback === "function") {
          callback(undefined, client, () => {});
          return;
        }
        return Promise.resolve(client);
      },
    } as unknown as Pool;

    interceptor.install(pool);
    await requestMetrics.runWithContext(async () => {
      const c = (await pool.connect()) as PoolClient;
      await c.query("SELECT 1");
      expect(requestMetrics.getQueryCount()).toBe(1);
    });
    expect(backend).toHaveBeenCalledWith("SELECT 1");
  });

  it("increments once for pg-pool-style connect + client.query (callback) path", async () => {
    const clientQuery = vi.fn(
      (text: string, cb: (e: Error | null, r: unknown) => void) => {
        cb(null, { rows: [] });
      },
    ) as unknown as PoolClient["query"];
    const client = {
      query: clientQuery,
      release: vi.fn(),
    } as unknown as PoolClient;
    const pool = {
      connect(
        callback?: (
          e: Error | undefined,
          c: PoolClient | undefined,
          r: (e2?: Error | boolean) => void,
        ) => void,
      ): void | Promise<PoolClient> {
        if (typeof callback === "function") {
          callback(undefined, client, () => {});
          return;
        }
        return Promise.resolve(client);
      },
    } as unknown as Pool;

    interceptor.install(pool);
    await requestMetrics.runWithContext(async () => {
      await mockPoolQuery(pool, "SELECT 1");
      expect(requestMetrics.getQueryCount()).toBe(1);
    });
  });

  it("increments query count when a query fails, and propagates the error", async () => {
    const err = new Error("connection refused");
    const backend = vi.fn().mockReturnValue(Promise.reject(err));
    const client = createPooledClientMock((text) => backend(text as string));
    const pool = {
      connect(
        callback?: (
          e: Error | undefined,
          c: PoolClient | undefined,
          r: (e2?: Error | boolean) => void,
        ) => void,
      ): void | Promise<PoolClient> {
        if (typeof callback === "function") {
          callback(undefined, client, () => {});
          return;
        }
        return Promise.resolve(client);
      },
    } as unknown as Pool;

    interceptor.install(pool);
    await requestMetrics.runWithContext(async () => {
      const c = (await pool.connect()) as PoolClient;
      await expect(c.query("SELECT 1")).rejects.toThrow("connection refused");
      expect(requestMetrics.getQueryCount()).toBe(1);
    });
  });

  it("warns on slow per-query round-trips", async () => {
    const backend = vi.fn().mockResolvedValue({ rows: [] });
    const client = createPooledClientMock((text) => backend(text as string));
    const pool = {
      connect(
        callback?: (
          e: Error | undefined,
          c: PoolClient | undefined,
          r: (e2?: Error | boolean) => void,
        ) => void,
      ): void | Promise<PoolClient> {
        if (typeof callback === "function") {
          callback(undefined, client, () => {});
          return;
        }
        return Promise.resolve(client);
      },
    } as unknown as Pool;

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
      const c = (await pool.connect()) as PoolClient;
      await c.query("SELECT sleep()");
    });

    expect(warnSpy).toHaveBeenCalled();
    expect(String(warnSpy.mock.calls[0][0])).toContain("slow-query");

    nowSpy.mockRestore();
  });
});
