"use client";

import { cn } from "@job-tracker/ui";
import { GoogleLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { APP_TITLE } from "@/app/metadata";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";

type LoginV2WelcomeCardProps = { onGoogleClick: () => void; error?: string; className?: string };

/** Centered sign-in card, styled after a typical Google product's own account chooser ([LoginV2]). */
export function LoginV2WelcomeCard({ onGoogleClick, error, className }: LoginV2WelcomeCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-border-default bg-(--color-border-brand) p-10 text-center text-text-inverted shadow-sm",
        className,
      )}
    >
      <AppBrandMark size={40} />

      <h1 className={cn("mt-6 text-2xl font-medium text-text-inverted")}>Sign in</h1>
      <p className={cn("mt-1 text-sm text-text-inverted/70")}>to continue to {APP_TITLE}</p>

      {!!error && (
        <p className={cn("mt-4 text-sm text-red-300")} role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="button"
        onClick={onGoogleClick}
        className={cn(
          "mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-border-default bg-bg-surface px-6 py-2.5",
          "text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-border-brand)",
        )}
      >
        <GoogleLogoIcon className={cn("size-5")} weight="regular" aria-hidden />
        Continue with Google
      </button>

      <p className={cn("mt-8 text-xs text-text-inverted/70")}>
        By continuing you agree to our{" "}
        <Link className={cn("text-text-inverted underline underline-offset-2")} href="/terms">
          Terms
        </Link>{" "}
        and{" "}
        <Link className={cn("text-text-inverted underline underline-offset-2")} href="/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
