"use client";

import { useApolloClient } from "@apollo/client/react";
import { authMutationRequestInit } from "@job-tracker/auth";
import { Button, cn, Heading } from "@job-tracker/ui";
import { SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getApiBaseUrl } from "@/lib/api-endpoints";

export type LoginStatusPanelStatus = "pending" | "rejected";

const COPY: Record<LoginStatusPanelStatus, { title: string; body: string }> = {
  pending: {
    title: "Access requested",
    body: "Your access request was received and is pending admin approval. Check back later — you'll be able to sign in once your account is approved.",
  },
  rejected: {
    title: "Access not granted",
    body: "Your access request was not approved. If you believe this is a mistake, contact the team that invited you.",
  },
};

type LoginStatusPanelProps = { status: LoginStatusPanelStatus; className?: string };

export function LoginStatusPanel({ status, className }: LoginStatusPanelProps) {
  const copy = COPY[status];
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch(
        `${getApiBaseUrl()}/auth/logout`,
        authMutationRequestInit({ method: "POST", credentials: "include" }),
      );
      await apolloClient.clearStore();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border border-border-default bg-bg-surface p-8 shadow-lg",
        "lg:flex lg:h-full lg:max-w-none lg:flex-col lg:justify-center lg:p-10",
        className,
      )}
    >
      <Heading as="h1" size="3xl" className={cn("font-semibold text-text-brand")}>
        {copy.title}
      </Heading>
      <p className={cn("mt-2 text-sm text-text-muted")}>{copy.body}</p>

      <Button
        type="button"
        intent="ghost"
        size="sm"
        colorScheme="error"
        state={loggingOut ? "loading" : "default"}
        leftIcon={<SignOutIcon size={16} />}
        onClick={() => void handleLogout()}
        className={cn("mt-6 w-fit")}
      >
        Log out
      </Button>
    </div>
  );
}
