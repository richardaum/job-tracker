"use client";

import { cn, GoogleLoginButton } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api-endpoints";
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
    <main>
      <div className={cn("mb-8 flex items-center gap-3")}>
        <AppBrandMark size={36} />
        <h1 className={cn("m-0 text-2xl font-semibold")}>Login</h1>
      </div>
      <GoogleLoginButton onClick={handleGoogleLogin} />
    </main>
  );
}
