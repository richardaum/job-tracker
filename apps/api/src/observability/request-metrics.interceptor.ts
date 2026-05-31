import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { finalize, Observable } from "rxjs";

import { QUERY_WARN_THRESHOLD, REQUEST_WARN_THRESHOLD_MS } from "./request-metrics.constants";
import { RequestMetricsContext } from "./request-metrics.context";

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestMetricsInterceptor.name);

  constructor(private readonly requestMetricsContext: RequestMetricsContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const requestName = this.getRequestName(context);
    const startedAt = performance.now();

    return new Observable((subscriber) => {
      let innerSubscription: { unsubscribe: () => void } | undefined;
      this.requestMetricsContext.runWithContext(() => {
        innerSubscription = next
          .handle()
          .pipe(
            finalize(() => {
              const durationMs = Math.round(performance.now() - startedAt);
              const queryCount = this.requestMetricsContext.getQueryCount();
              const message = `${requestName} took ${durationMs}ms with ${queryCount} DB queries`;

              if (durationMs >= REQUEST_WARN_THRESHOLD_MS || queryCount >= QUERY_WARN_THRESHOLD) {
                this.logger.warn(message);
                return;
              }
              this.logger.log(message);
            }),
          )
          .subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
      });
      return () => {
        innerSubscription?.unsubscribe();
      };
    });
  }

  private getRequestName(context: ExecutionContext): string {
    if (context.getType<string>() === "graphql") {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      const operationName = info.operation.name?.value;
      const fieldName = info.fieldName;
      return operationName ? `graphql:${operationName}.${fieldName}` : `graphql:${fieldName}`;
    }

    const handlerName = context.getHandler()?.name ?? "unknown-handler";
    const className = context.getClass()?.name ?? "unknown-class";
    return `http:${className}.${handlerName}`;
  }
}
