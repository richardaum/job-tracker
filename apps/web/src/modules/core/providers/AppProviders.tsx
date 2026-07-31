"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import type { ReactNode } from "react";

import { createApolloClient } from "@/lib/make-apollo-client";
import { PasteListenerProvider } from "@/modules/core/providers/PasteListenerProvider";
import { ToastQueueProvider } from "@/modules/jobs/shared/hooks/ToastQueueProvider";
import { AiBlockedDialog } from "@/components/ai-blocked-dialog/AiBlockedDialog";

type AppProvidersProps = { children: ReactNode };
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ApolloNextAppProvider makeClient={createApolloClient}>
      <ToastQueueProvider>
        <PasteListenerProvider>
          {children}
          <AiBlockedDialog />
        </PasteListenerProvider>
      </ToastQueueProvider>
    </ApolloNextAppProvider>
  );
}
