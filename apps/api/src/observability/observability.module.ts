import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { DatabasePoolInterceptor } from "./database-pool.interceptor";
import { RequestMetricsContext } from "./request-metrics.context";
import { RequestMetricsInterceptor } from "./request-metrics.interceptor";

@Module({
  providers: [
    RequestMetricsContext,
    DatabasePoolInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
  ],
  exports: [RequestMetricsContext, DatabasePoolInterceptor],
})
export class ObservabilityModule {}
