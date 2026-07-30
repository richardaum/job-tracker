"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogJsProvider } from "posthog-js/react";
import { type ReactNode, useEffect } from "react";

import { clientEnv } from "@/env/client";

type PostHogProviderProps = { children: ReactNode };

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY || posthog.__loaded) return;

    posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, []);

  if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY) return children;

  return <PostHogJsProvider client={posthog}>{children}</PostHogJsProvider>;
}
