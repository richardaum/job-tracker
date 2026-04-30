"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "@job-tracker/ui";
import { NEXT_PUBLIC_API_URL } from "@/env/client";
import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const API_URL = NEXT_PUBLIC_API_URL ?? "http://localhost:3101";

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
      `${API_URL}/auth/google?returnTo=${encodeURIComponent(safeReturnTo)}`,
    );
  };

  return (
    <main>
      <h1>Login</h1>
      <GoogleLoginButton onClick={handleGoogleLogin} />
    </main>
  );
}
