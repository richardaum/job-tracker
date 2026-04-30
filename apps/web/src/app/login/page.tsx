"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "@job-tracker/ui";
import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api-endpoints";

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
    window.location.assign(
      `${getApiBaseUrl()}/auth/google?returnTo=${encodeURIComponent(safeReturnTo)}`,
    );
  };

  return (
    <main>
      <h1>Login</h1>
      <GoogleLoginButton onClick={handleGoogleLogin} />
    </main>
  );
}
