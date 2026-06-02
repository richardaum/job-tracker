import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable, delay } from "rxjs";

import { apiEnv } from "@api/env/server";

const MIN_DELAY = 1000;
const MAX_DELAY = 2000;

@Injectable()
export class SimulatedLatencyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!apiEnv.SIMULATED_LATENCY_ENABLED) {
      return next.handle();
    }

    const ms = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;

    return next.handle().pipe(delay(ms));
  }
}
