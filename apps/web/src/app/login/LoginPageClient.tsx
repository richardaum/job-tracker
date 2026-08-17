"use client";

import { cn } from "@job-tracker/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { APP_TITLE } from "@/app/metadata";
import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { hasGraphQLCode } from "@/lib/graphql-entity-errors";
import { LoginSocialPanel } from "@/modules/auth/login/LoginSocialPanel";
import { LoginSpotlightGrid } from "@/modules/auth/login/LoginSpotlightGrid";
import type { LoginStatusPanelStatus } from "@/modules/auth/login/LoginStatusPanel";
import { LoginStatusPanel } from "@/modules/auth/login/LoginStatusPanel";
import { LoginV2Shell } from "@/modules/auth/login/LoginV2Shell";
import { LoginV2WelcomeCard } from "@/modules/auth/login/LoginV2WelcomeCard";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";

function isAuthError(error: unknown): boolean {
  return hasGraphQLCode(error, "UNAUTHENTICATED");
}

function toLoginStatus(value: string | null): LoginStatusPanelStatus | undefined {
  return value === "pending" || value === "rejected" ? value : undefined;
}

type LoginPageClientProps = { loginV2Enabled: boolean };

export function LoginPageClient({ loginV2Enabled }: LoginPageClientProps) {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const { safeReturnTo } = useAuthReturnTo();
  const searchParams = useSearchParams();
  const status = toLoginStatus(searchParams.get("status"));

  useEffect(() => {
    if (!loading && user) {
      router.replace(safeReturnTo);
    }
  }, [loading, router, safeReturnTo, user]);

  const handleGoogleLogin = () => {
    // Full navigation to API origin for OAuth (not an in-app Next route).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${getApiBaseUrl()}/auth/google?returnTo=${encodeURIComponent(safeReturnTo)}`);
  };

  if (loginV2Enabled) {
    return (
      <LoginV2Shell>
        {status ? (
          <LoginStatusPanel status={status} className={cn("shadow-xl")} />
        ) : (
          <LoginV2WelcomeCard
            onGoogleClick={handleGoogleLogin}
            error={isAuthError(error) ? undefined : error?.message}
          />
        )}
      </LoginV2Shell>
    );
  }

  return (
    <main className={cn("jt-login-shell-backdrop flex min-h-svh flex-col text-text-primary")}>
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-335 flex-1 flex-col justify-center px-6 pb-6 pt-8 lg:flex-1 lg:px-12 lg:pb-10 lg:pt-22",
        )}
      >
        <header className={cn("mb-8 shrink-0", "text-text-inverted")}>
          <span className={cn("inline-flex items-center gap-3")}>
            <AppBrandMark size={38} />
            <span className={cn("text-lg font-semibold tracking-tight")}>{APP_TITLE}</span>
          </span>
        </header>

        <div
          className={cn(
            "grid grid-cols-1 gap-10",
            "lg:grid-cols-[minmax(17.5rem,0.42fr)_minmax(0,1fr)] lg:items-stretch lg:gap-14",
            "xl:grid-cols-[minmax(19rem,0.4fr)_minmax(0,1fr)] xl:gap-16",
          )}
        >
          <div
            className={cn(
              "flex min-h-0 w-full flex-col justify-center",
              "mx-auto max-w-md lg:mx-0 lg:h-full lg:max-w-none lg:justify-center",
            )}
          >
            {status ? (
              <LoginStatusPanel status={status} className={cn("shadow-xl")} />
            ) : (
              <LoginSocialPanel
                brandName={APP_TITLE}
                onGoogleClick={handleGoogleLogin}
                error={isAuthError(error) ? undefined : error?.message}
                className={cn("shadow-xl")}
              />
            )}
          </div>
          <div className={cn("flex min-w-0 flex-col lg:pb-2 lg:pr-4 xl:pr-6")}>
            <LoginSpotlightGrid className={cn("py-2 lg:py-0")} />
          </div>
        </div>
      </div>
    </main>
  );
}
