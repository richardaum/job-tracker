import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { DatabasePoolInterceptor } from "./database-pool.interceptor";
import { RequestMetricsContext } from "./request-metrics.context";
import { RequestMetricsInterceptor } from "./request-metrics.interceptor";
import { SimulatedLatencyInterceptor } from "./simulated-latency.interceptor";

@Module({
  providers: [
    RequestMetricsContext,
    DatabasePoolInterceptor,
    { provide: APP_INTERCEPTOR, useClass: RequestMetricsInterceptor },
    SimulatedLatencyInterceptor,
    { provide: APP_INTERCEPTOR, useClass: SimulatedLatencyInterceptor },
  ],
  exports: [RequestMetricsContext, DatabasePoolInterceptor],
})
export class ObservabilityModule {}
