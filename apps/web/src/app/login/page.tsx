"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "@job-tracker/ui";
import { NEXT_PUBLIC_API_URL } from "@/env/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const API_URL = NEXT_PUBLIC_API_URL ?? "http://localhost:3101";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  const handleGoogleLogin = () => {
    window.location.assign(`${API_URL}/auth/google`);
  };

  return (
    <main>
      <h1>Login</h1>
      <GoogleLoginButton onClick={handleGoogleLogin} />
    </main>
  );
}
