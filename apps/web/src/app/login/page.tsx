"use client";

import { cn } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { APP_TITLE } from "@/app/metadata";
import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { LoginSocialPanel } from "@/modules/auth/login/LoginSocialPanel";
import { LoginSpotlightGrid } from "@/modules/auth/login/LoginSpotlightGrid";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const { safeReturnTo } = useAuthReturnTo();

  useEffect(() => {
    if (!loading && user) {
      router.replace(safeReturnTo);
    }
  }, [loading, router, safeReturnTo, user]);

  const handleGoogleLogin = () => {
    // Full navigation to API origin for OAuth (not an in-app Next route).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- cross-origin auth redirect
    window.location.assign(
      `${getApiBaseUrl()}/auth/google?returnTo=${encodeURIComponent(safeReturnTo)}`,
    );
  };

  return (
    <main
      className={cn(
        "jt-login-shell-backdrop flex h-svh max-h-dvh flex-col overflow-hidden text-text-primary",
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex min-h-0 w-full max-w-[1340px] flex-1 flex-col px-6 pb-6 pt-8 lg:flex-1 lg:px-12 lg:pb-10 lg:pt-22",
        )}
      >
        <header
          className={cn(
            "mb-8 shrink-0 lg:absolute lg:inset-x-12 lg:left-12 lg:right-auto lg:top-7 lg:z-10 lg:mb-0",
            "text-text-inverted",
          )}
        >
          <span className={cn("inline-flex items-center gap-3")}>
            <AppBrandMark size={38} />
            <span className={cn("text-lg font-semibold tracking-tight")}>
              {APP_TITLE}
            </span>
          </span>
        </header>

        <div
          className={cn(
            "grid min-h-0 flex-1 grid-cols-1 gap-10",
            "lg:grid-cols-[minmax(17.5rem,0.42fr)_minmax(0,1fr)] lg:gap-14 lg:overflow-hidden lg:items-stretch",
            "xl:grid-cols-[minmax(19rem,0.4fr)_minmax(0,1fr)] xl:gap-16",
          )}
        >
          <div
            className={cn(
              "flex min-h-0 w-full flex-col justify-center",
              "mx-auto max-w-md lg:mx-0 lg:max-w-none lg:h-full lg:justify-stretch",
            )}
          >
            <LoginSocialPanel
              brandName={APP_TITLE}
              onGoogleClick={handleGoogleLogin}
              className={cn("shadow-xl")}
            />
          </div>
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col lg:overflow-hidden lg:pb-2 lg:pr-4 xl:pr-6",
            )}
          >
            <LoginSpotlightGrid className={cn("min-h-0 flex-1 py-2 lg:py-0")} />
          </div>
        </div>
      </div>
    </main>
  );
}
