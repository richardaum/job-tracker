import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";

type RequestMetricsStore = { queryCount: number };

@Injectable()
export class RequestMetricsContext {
  private readonly storage = new AsyncLocalStorage<RequestMetricsStore>();

  runWithContext<T>(callback: () => T): T {
    return this.storage.run({ queryCount: 0 }, callback);
  }

  incrementQueryCount(): void {
    const store = this.storage.getStore();
    if (!store) {
      return;
    }
    store.queryCount += 1;
  }

  getQueryCount(): number {
    const store = this.storage.getStore();
    return store?.queryCount ?? 0;
  }
}
