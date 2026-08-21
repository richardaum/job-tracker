"use client";

import { cn } from "@job-tracker/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { APP_TITLE } from "@/app/metadata";
import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasGraphQLCode } from "@/lib/graphql-entity-errors";
import type { LoginStatusPanelStatus } from "@/modules/auth/login/LoginStatusPanel";
import { LoginStatusPanel } from "@/modules/auth/login/LoginStatusPanel";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";

function isAuthError(error: unknown): boolean {
  return hasGraphQLCode(error, "UNAUTHENTICATED");
}

function toLoginStatus(value: string | null): LoginStatusPanelStatus | undefined {
  return value === "pending" || value === "rejected" ? value : undefined;
}

export function LoginPageClient() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const { safeReturnTo } = useAuthReturnTo();
  const searchParams = useSearchParams();
  const status = toLoginStatus(searchParams.get("status"));
  const isLoadingView = searchParams.get("view") === "loading";

  useEffect(() => {
    if (!isLoadingView && !loading && user) {
      router.replace(safeReturnTo);
    }
  }, [isLoadingView, loading, router, safeReturnTo, user]);

  useEffect(() => {
    if (!isLoadingView && !loading && !user && !status) {
      router.replace(`/?signIn=open&returnTo=${encodeURIComponent(safeReturnTo)}`);
    }
  }, [isLoadingView, loading, router, safeReturnTo, status, user]);

  return (
    <main className={cn("flex min-h-svh items-center justify-center bg-bg-surface px-6 text-text-primary")}>
      {status && !isLoadingView ? (
        <LoginStatusPanel status={status} className={cn("w-full max-w-6xl")} />
      ) : (
        <div className={cn("w-full max-w-sm text-center")}>
          <span className={cn("inline-flex items-center gap-2.5 text-sm font-semibold")}>
            <AppBrandMark size={30} className={cn("rounded-lg")} />
            {APP_TITLE}
          </span>
          <>
            <div
              className={cn(
                "mx-auto mt-10 size-7 animate-spin rounded-full border-2 border-border-default border-t-border-brand",
              )}
              aria-hidden
            />
            <h1 className={cn("mt-5 text-lg font-semibold")}>Finalizing your access…</h1>
            <p className={cn("mt-2 text-sm text-text-secondary")}>
              We&apos;re confirming your account and will take you there shortly.
            </p>
            {!loading && error && !isAuthError(error) ? (
              <p className={cn("mt-4 text-sm text-text-error")} role="alert">
                We couldn&apos;t confirm your session. Taking you back to sign in.
              </p>
            ) : null}
          </>
        </div>
      )}
    </main>
  );
}
