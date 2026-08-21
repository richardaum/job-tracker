"use client";

import { cn, Text } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Sidebar } from "@/modules/navigation/components/Sidebar";

const NPS_SURVEY_ELIGIBLE_EVENT = "nps_survey_eligible";

function AuthenticatedFullscreenLoadingScreen() {
  return (
    <div className={cn("flex h-screen items-center justify-center bg-bg-shell")}>
      <Text as="span" size="sm" color="secondary">
        Loading…
      </Text>
    </div>
  );
}

type AuthenticatedLayoutProps = { children: ReactNode; quickTipsEnabled?: boolean };
export function AuthenticatedLayout({ children, quickTipsEnabled = false }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const { loginRedirectUrl } = useAuthReturnTo();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginRedirectUrl);
    }
  }, [loading, loginRedirectUrl, router, user]);

  if (loading) {
    return <AuthenticatedFullscreenLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={cn("flex h-screen bg-bg-shell")}>
      <Sidebar user={user} quickTipsEnabled={quickTipsEnabled} open={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <NpsSurveyEligibilityTrigger userId={user.id} />

      <div className={cn("flex flex-1 overflow-hidden p-2 md:pl-0")}>
        <div className={cn("flex flex-1 flex-col overflow-hidden rounded-xl bg-bg-surface")}>
          <div className={cn("border-b border-border-subtle px-4 py-3 md:hidden")}>
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className={cn(
                "rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-hover",
              )}
            >
              Menu
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

type NpsSurveyEligibilityTriggerProps = { userId: string };

function NpsSurveyEligibilityTrigger({ userId }: NpsSurveyEligibilityTriggerProps) {
  const posthog = usePostHog();
  const triggeredUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog || triggeredUserIdRef.current === userId) return;

    let isCurrentUser = true;

    posthog.getSurveys((_surveys, context) => {
      if (!isCurrentUser || !context?.isLoaded || triggeredUserIdRef.current === userId) return;

      triggeredUserIdRef.current = userId;
      posthog.capture(NPS_SURVEY_ELIGIBLE_EVENT);
    });

    return () => {
      isCurrentUser = false;
    };
  }, [posthog, userId]);

  return null;
}
