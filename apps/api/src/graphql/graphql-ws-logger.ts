import { Logger } from "@nestjs/common";
import type { ExecutionArgs, ExecutionResult } from "graphql";
import { subscribe } from "graphql";
import type { OperationResult } from "graphql-ws";

const log = new Logger("GraphQLWs");

export function createWsSubscribe() {
  return async (args: ExecutionArgs): Promise<OperationResult> => {
    const result = await subscribe(args);

    if (result && Symbol.asyncIterator in (result as object)) {
      const original = result as AsyncIterableIterator<ExecutionResult>;
      const iterator = original[Symbol.asyncIterator]();
      return {
        [Symbol.asyncIterator]() {
          return {
            next: async () => {
              const item = await iterator.next();
              if (item.value?.errors?.length) {
                for (const err of item.value.errors) {
                  log.warn(`Subscription error: ${err.message}`);
                }
              }
              return item;
            },
            return: async () => {
              await iterator.return?.();
              return { value: undefined, done: true } as IteratorResult<ExecutionResult>;
            },
            throw: async (err: unknown) => {
              await iterator.throw?.(err);
              return { value: undefined, done: true } as IteratorResult<ExecutionResult>;
            },
          };
        },
      };
    }

    return result;
  };
}
