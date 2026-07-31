"use client";

import { useRouter } from "next/navigation";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useEffect } from "react";

type SourcesLayoutProps = { children: React.ReactNode };

export default function SourcesLayout({ children }: SourcesLayoutProps) {
  const router = useRouter();
  const sourcesEnabled = useFeatureFlagEnabled("sources-enabled");

  useEffect(() => {
    if (sourcesEnabled === false) {
      router.replace("/jobs");
    }
  }, [sourcesEnabled, router]);

  if (sourcesEnabled !== true) return null;

  return children;
}
