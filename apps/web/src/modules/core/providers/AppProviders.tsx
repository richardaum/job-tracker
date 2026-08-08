"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import type { ReactNode } from "react";

import { createApolloClient } from "@/lib/make-apollo-client";
import { PasteListenerProvider } from "@/modules/core/providers/PasteListenerProvider";
import { PostHogProvider } from "@/modules/core/providers/PostHogProvider";
import { ToastQueueProvider } from "@/modules/jobs/shared/hooks/ToastQueueProvider";
import { TourProvider } from "@/modules/tour/TourProvider";
import { WELCOME_TOUR_REGISTRY } from "@/modules/welcome-tour/welcomeTourDefinitions";
import { AiBlockedDialog } from "@/components/ai-blocked-dialog/AiBlockedDialog";

type AppProvidersProps = { children: ReactNode };
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PostHogProvider>
      <ApolloNextAppProvider makeClient={createApolloClient}>
        <TourProvider registry={WELCOME_TOUR_REGISTRY}>
          <ToastQueueProvider>
            <PasteListenerProvider>
              {children}
              <AiBlockedDialog />
            </PasteListenerProvider>
          </ToastQueueProvider>
        </TourProvider>
      </ApolloNextAppProvider>
    </PostHogProvider>
  );
}
