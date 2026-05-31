import { Injectable, Logger } from "@nestjs/common";
import type { Pool, PoolClient, QueryConfig } from "pg";

import { DATABASE_POOL_SLOW_QUERY_WARN_MS } from "./request-metrics.constants";
import { RequestMetricsContext } from "./request-metrics.context";

/**
 * Instruments pg `Client` / `PoolClient` `query` (and thus TypeORM, which uses leased pool
 * clients). `Pool.prototype.query` in node-postgres is implemented as `connect` +
 * `client.query`, so we only wrap `client.query` to avoid double-counting.
 */
@Injectable()
export class DatabasePoolInterceptor {
  private readonly logger = new Logger(DatabasePoolInterceptor.name);
  private readonly wrappedClients = new WeakSet<PoolClient>();

  constructor(private readonly requestMetricsContext: RequestMetricsContext) {}

  install(pool: Pool): void {
    this.patchConnect(pool);
  }

  private patchConnect(pool: Pool): void {
    const originalConnect = pool.connect.bind(pool) as {
      (callback: ConnectCallback): void;
      (): Promise<PoolClient>;
    };

    const wrapIfNeeded = (client: PoolClient) => {
      if (this.wrappedClients.has(client)) {
        return;
      }
      this.wrappedClients.add(client);
      const originalQuery = client.query.bind(client);
      client.query = this.instrumentClientQuery(originalQuery) as typeof client.query;
    };

    pool.connect = function (this: Pool, cb?: ConnectCallback): void | Promise<PoolClient> {
      if (typeof cb === "function") {
        return originalConnect((err, client, done) => {
          if (client) {
            wrapIfNeeded(client);
          }
          return cb(err, client, done);
        });
      }
      return originalConnect().then((client) => {
        wrapIfNeeded(client);
        return client;
      });
    } as typeof pool.connect;
  }

  private instrumentClientQuery(originalQuery: PoolClient["query"]): PoolClient["query"] {
    return ((...args: unknown[]) => {
      this.requestMetricsContext.incrementQueryCount();
      const startedAt = performance.now();
      const queryText = this.getQueryText(args[0]);

      const last = args[args.length - 1];
      if (typeof last === "function" && args.length >= 2) {
        const userCb = last as (err: Error, result: unknown) => void;
        const wrapped = (err: Error, result: unknown) => {
          this.logSlowIfNeeded(startedAt, queryText);
          return userCb(err, result);
        };
        return (originalQuery as (...a: unknown[]) => unknown)(...args.slice(0, -1), wrapped);
      }

      const out = (originalQuery as (...a: unknown[]) => unknown)(...args) as
        | { then: (f: () => void) => unknown }
        | unknown;

      if (out && typeof (out as { then?: unknown }).then === "function") {
        void Promise.resolve(out as Promise<unknown>)
          .finally(() => {
            this.logSlowIfNeeded(startedAt, queryText);
          })
          .catch(() => {
            // intentionally empty — errors propagate via returned promise
          });
        return out;
      }
      this.logSlowIfNeeded(startedAt, queryText);
      return out;
    }) as PoolClient["query"];
  }

  private logSlowIfNeeded(startedAt: number, queryText: string | undefined) {
    const elapsedMs = Math.round(performance.now() - startedAt);
    if (elapsedMs < DATABASE_POOL_SLOW_QUERY_WARN_MS) {
      return;
    }
    const normalizedQuery = queryText?.replace(/\s+/g, " ").trim().slice(0, 180);
    this.logger.warn(
      `[db][slow-query] ${elapsedMs}ms${normalizedQuery ? ` query="${normalizedQuery}"` : ""}`,
    );
  }

  private getQueryText(queryArg: unknown): string | undefined {
    if (typeof queryArg === "string") {
      return queryArg;
    }
    if (
      queryArg &&
      typeof queryArg === "object" &&
      "text" in queryArg &&
      typeof (queryArg as QueryConfig).text === "string"
    ) {
      return (queryArg as QueryConfig).text;
    }
    return undefined;
  }
}

type ConnectCallback = (
  err: Error | undefined,
  client: PoolClient | undefined,
  release: (err?: Error | boolean) => void,
) => void;
