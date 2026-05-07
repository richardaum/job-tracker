"use client";

import { ApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";

import { apolloClient } from "@/lib/apollo-client";
import { ToastQueueProvider } from "@/modules/applications/shared/hooks/ToastQueueProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ToastQueueProvider>{children}</ToastQueueProvider>
    </ApolloProvider>
  );
}
