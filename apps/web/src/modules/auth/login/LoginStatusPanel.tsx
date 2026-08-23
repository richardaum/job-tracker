"use client";

import { Button, cn, Heading } from "@job-tracker/ui";
import { GoogleLogoIcon } from "@phosphor-icons/react";

import { APP_TITLE } from "@/app/metadata";
import { signInWithGoogle } from "@/lib/auth-client";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";

export type LoginStatusPanelStatus = "pending" | "rejected" | "deactivated";

const COPY: Record<LoginStatusPanelStatus, { title: string; body: string; statusLabel: string }> = {
  pending: {
    title: "Access requested",
    body: "Your account is at the access checkpoint. We'll unlock your workspace as soon as an administrator approves it.",
    statusLabel: "Access under review",
  },
  rejected: {
    title: "Access not granted",
    body: "This account hasn't been approved. Contact the team that invited you if you need help.",
    statusLabel: "Access unavailable",
  },
  deactivated: {
    title: "Account deactivated",
    body: "This account has been deactivated. Contact the team that invited you if you believe this is a mistake.",
    statusLabel: "Access unavailable",
  },
};

type LoginStatusPanelProps = { status: LoginStatusPanelStatus; className?: string };

export function LoginStatusPanel({ status, className }: LoginStatusPanelProps) {
  const copy = COPY[status];

  function handleRetryLogin() {
    void signInWithGoogle(`${window.location.origin}/jobs`);
  }

  function handleSwitchAccount() {
    void signInWithGoogle(`${window.location.origin}/jobs`, true);
  }

  return (
    <section
      aria-labelledby="access-status-title"
      className={cn(
        "grid min-h-100 overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-lg",
        "lg:grid-cols-[minmax(18rem,0.37fr)_minmax(0,0.63fr)]",
        className,
      )}
    >
      <aside className={cn("bg-bg-brand-strong p-8 text-text-inverted sm:p-10")}>
        <span className={cn("inline-flex items-center gap-2.5 text-sm font-semibold")}>
          <AppBrandMark size={30} className={cn("rounded-lg")} />
          {APP_TITLE}
        </span>
        <ol className={cn("mt-9 grid gap-4 text-sm")}>
          <li className={cn("flex items-center gap-3 text-text-inverted")}>
            <span className={cn("size-2 rounded-full bg-(--primitive-color-green-500)")} aria-hidden />
            Google account connected
          </li>
          <li className={cn("flex items-center gap-3 font-semibold text-text-inverted")}>
            <span
              className={cn(
                "size-2 rounded-full border-2",
                status === "pending" ? "border-border-warning" : "border-border-error",
              )}
              aria-hidden
            />
            {copy.statusLabel}
          </li>
          <li className={cn("flex items-center gap-3 text-text-inverted/50")}>
            <span className={cn("size-2 rounded-full border border-current")} aria-hidden />
            Workspace ready
          </li>
        </ol>
      </aside>

      <div className={cn("relative flex min-h-75 flex-col px-8 py-12 sm:px-12 sm:py-18")}>
        <div className={cn("flex w-full flex-1 items-center")}>
          <div className={cn("flex max-w-xl items-start gap-5")}>
            <span
              className={cn(
                "mt-0.5 grid size-12 shrink-0 place-items-center rounded-full text-lg",
                status === "pending"
                  ? "bg-bg-warning-subtle text-(--primitive-color-yellow-950)"
                  : "bg-bg-error-subtle text-text-error",
              )}
              aria-hidden
            >
              {status === "pending" ? "◷" : "×"}
            </span>
            <div>
              <Heading as="h1" id="access-status-title" size="2xl" className={cn("font-semibold")}>
                {copy.title}
              </Heading>
              <p className={cn("mt-2 max-w-lg text-sm/relaxed text-text-secondary")}>{copy.body}</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-10 flex w-full flex-col items-stretch gap-2 sm:absolute sm:right-12 sm:bottom-10 sm:mt-0 sm:w-auto sm:flex-row sm:items-center sm:justify-end",
          )}
        >
          <Button
            type="button"
            intent="primary"
            size="sm"
            leftIcon={<GoogleLogoIcon size={14} weight="bold" />}
            onClick={handleRetryLogin}
          >
            Try signing in again
          </Button>
          <Button type="button" intent="ghost" size="sm" onClick={handleSwitchAccount}>
            Use a different account
          </Button>
        </div>
      </div>
    </section>
  );
}
