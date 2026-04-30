import "reflect-metadata";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ExecutionContext } from "@nestjs/common";
import type { CallHandler } from "@nestjs/common";
import { firstValueFrom, of } from "rxjs";
import { tap } from "rxjs/operators";
import {
  QUERY_WARN_THRESHOLD,
  REQUEST_WARN_THRESHOLD_MS,
} from "./request-metrics.constants";
import { RequestMetricsContext } from "./request-metrics.context";
import { RequestMetricsInterceptor } from "./request-metrics.interceptor";

function makeHttpContext(): ExecutionContext {
  return {
    getType: () => "http",
    getHandler: () => function handler() {},
    getClass: () => class TestController {},
    switchToHttp: () => ({ getRequest: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe("RequestMetricsInterceptor", () => {
  let requestMetricsContext: RequestMetricsContext;
  let interceptor: RequestMetricsInterceptor;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    requestMetricsContext = new RequestMetricsContext();
    interceptor = new RequestMetricsInterceptor(requestMetricsContext);
    logSpy = vi
      .spyOn(interceptor["logger"], "log")
      .mockImplementation(() => {});
    warnSpy = vi
      .spyOn(interceptor["logger"], "warn")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs at info for fast requests with low query count", async () => {
    const ctx = makeHttpContext();
    const handler: CallHandler = { handle: () => of(1) };

    await firstValueFrom(interceptor.intercept(ctx, handler));

    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toMatch(
      /http:TestController\.handler took \d+ms with 0 DB queries/,
    );
  });

  it("warns when duration meets the request latency threshold", async () => {
    const nowSpy = vi
      .spyOn(performance, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(REQUEST_WARN_THRESHOLD_MS);

    const ctx = makeHttpContext();
    const handler: CallHandler = { handle: () => of(1) };

    await firstValueFrom(interceptor.intercept(ctx, handler));

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(
      new RegExp(
        String.raw`http:TestController\.handler took ${REQUEST_WARN_THRESHOLD_MS}ms with 0 DB queries`,
      ),
    );
    expect(logSpy).not.toHaveBeenCalled();

    nowSpy.mockRestore();
  });

  it("warns when query count meets the threshold", async () => {
    const ctx = makeHttpContext();
    const handler: CallHandler = {
      handle: () =>
        of(1).pipe(
          tap(() => {
            for (let i = 0; i < QUERY_WARN_THRESHOLD; i += 1) {
              requestMetricsContext.incrementQueryCount();
            }
          }),
        ),
    };

    await firstValueFrom(interceptor.intercept(ctx, handler));

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(
      new RegExp(
        String.raw`http:TestController\.handler took \d+ms with ${QUERY_WARN_THRESHOLD} DB queries`,
      ),
    );
  });
});
