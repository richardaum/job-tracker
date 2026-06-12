"use client";

import { useCallback, useEffect, useRef } from "react";
import { useApolloClient } from "@apollo/client/react";
import type { DocumentNode, TypedDocumentNode } from "@apollo/client";
import type { OperationVariables } from "@apollo/client";

interface LazySubscribeOptions<TData> {
  onData?: (data: TData) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useLazySubscription<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  subscription: DocumentNode | TypedDocumentNode<TData, TVariables>,
) {
  const client = useApolloClient();
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    return () => {
      subRef.current?.unsubscribe();
    };
  }, []);

  const unsubscribe = useCallback(() => {
    subRef.current?.unsubscribe();
    subRef.current = null;
  }, []);

  const subscribe = useCallback(
    (variables: TVariables, options?: LazySubscribeOptions<TData>): Promise<void> => {
      subRef.current?.unsubscribe();

      return new Promise<void>((resolve, reject) => {
        const observable = client.subscribe<TData, TVariables>({ query: subscription, variables });

        subRef.current = observable.subscribe({
          next(result) {
            if (result.data) {
              options?.onData?.(result.data);
            }
            resolve();
          },
          error(err) {
            options?.onError?.(err as Error);
            reject(err);
          },
        });
      });
    },
    [client, subscription],
  );

  return [subscribe, unsubscribe] as const;
}
