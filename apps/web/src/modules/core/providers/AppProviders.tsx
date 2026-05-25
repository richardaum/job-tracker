"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import type { ReactNode } from "react";

import { createApolloClient } from "@/lib/make-apollo-client";
import { PasteListenerProvider } from "@/modules/core/providers/PasteListenerProvider";
import { ToastQueueProvider } from "@/modules/jobs/shared/hooks/ToastQueueProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={createApolloClient}>
      <ToastQueueProvider>
        <PasteListenerProvider>{children}</PasteListenerProvider>
      </ToastQueueProvider>
    </ApolloNextAppProvider>
  );
}
