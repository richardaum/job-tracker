import { Injectable, Logger } from "@nestjs/common";
import type { QueryConfig } from "pg";
import { Pool } from "pg";
import { DATABASE_POOL_SLOW_QUERY_WARN_MS } from "./request-metrics.constants";
import { RequestMetricsContext } from "./request-metrics.context";

/**
 * Installs `pool.query` wrapping: per-request query counts (via `RequestMetricsContext`) and
 * slow-query warnings. Not a `NestInterceptor` (those apply to HTTP/GraphQL); this hooks the
 * driver at the connection pool, similar in spirit to request metrics.
 */
@Injectable()
export class DatabasePoolInterceptor {
  private readonly logger = new Logger(DatabasePoolInterceptor.name);

  constructor(private readonly requestMetricsContext: RequestMetricsContext) {}

  install(pool: Pool): void {
    const originalQuery = pool.query.bind(pool) as (
      queryTextOrConfig: string | QueryConfig,
      values?: unknown[],
    ) => Promise<unknown>;

    const instrumentedQuery = (
      queryTextOrConfig: string | QueryConfig,
      values?: unknown[],
    ): Promise<unknown> => {
      this.requestMetricsContext.incrementQueryCount();
      const startedAt = performance.now();
      const queryText = this.getQueryText(queryTextOrConfig);

      const queryPromise = originalQuery(queryTextOrConfig, values);
      void queryPromise
        .finally(() => {
          const elapsedMs = Math.round(performance.now() - startedAt);
          if (elapsedMs < DATABASE_POOL_SLOW_QUERY_WARN_MS) {
            return;
          }
          const normalizedQuery = queryText
            ?.replace(/\s+/g, " ")
            .trim()
            .slice(0, 180);
          this.logger.warn(
            `[db][slow-query] ${elapsedMs}ms${normalizedQuery ? ` query="${normalizedQuery}"` : ""}`,
          );
        })
        // Caller awaits `queryPromise`; the `finally` chain is only for side effects.
        .catch(() => {
          // intentionally empty
        });

      return queryPromise;
    };

    pool.query = instrumentedQuery as Pool["query"];
  }

  private getQueryText(queryArg: string | QueryConfig): string | undefined {
    if (typeof queryArg === "string") {
      return queryArg;
    }
    if (typeof queryArg.text === "string") {
      return queryArg.text;
    }
    return undefined;
  }
}
