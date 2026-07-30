"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import type { ReactNode } from "react";

import { createApolloClient } from "@/lib/make-apollo-client";
import { PasteListenerProvider } from "@/modules/core/providers/PasteListenerProvider";
import { PostHogProvider } from "@/modules/core/providers/PostHogProvider";
import { ToastQueueProvider } from "@/modules/jobs/shared/hooks/ToastQueueProvider";

type AppProvidersProps = { children: ReactNode };
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PostHogProvider>
      <ApolloNextAppProvider makeClient={createApolloClient}>
        <ToastQueueProvider>
          <PasteListenerProvider>{children}</PasteListenerProvider>
        </ToastQueueProvider>
      </ApolloNextAppProvider>
    </PostHogProvider>
  );
}
