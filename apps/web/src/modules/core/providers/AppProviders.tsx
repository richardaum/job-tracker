"use client";

import { ApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";

import { apolloClient } from "@/lib/apollo-client";
import { PasteListenerProvider } from "@/modules/core/providers/PasteListenerProvider";
import { ToastQueueProvider } from "@/modules/jobs/shared/hooks/ToastQueueProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ToastQueueProvider>
        <PasteListenerProvider>{children}</PasteListenerProvider>
      </ToastQueueProvider>
    </ApolloProvider>
  );
}
