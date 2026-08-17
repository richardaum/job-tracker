"use client";

import { cn, Heading } from "@job-tracker/ui";
import { AppleLogoIcon, FacebookLogoIcon, GoogleLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Circular row uses visible disabled providers (**[T-167]**): backend ships Google only;
 * other buttons stay disabled with truthful `title` / `aria-label` (no Tooltip on disabled triggers).
 */

function SocialDivider() {
  return (
    <div className={cn("flex items-center gap-4")}>
      <div className={cn("h-px flex-1 bg-border-subtle")} aria-hidden />
      <span className={cn("shrink-0 text-xs font-medium text-text-muted")}>Or continue with</span>
      <div className={cn("h-px flex-1 bg-border-subtle")} aria-hidden />
    </div>
  );
}

type SocialComingSoonGlyphProps = { label: string; children: ReactNode };
function SocialComingSoonGlyph({ label, children }: SocialComingSoonGlyphProps) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      aria-label={`${label} (coming soon)`}
      className={cn(
        "inline-flex size-12 cursor-not-allowed items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-primary opacity-60",
        "shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

type LoginSocialPanelProps = { brandName: string; onGoogleClick: () => void; error?: string; className?: string };

export function LoginSocialPanel({ brandName, onGoogleClick, error, className }: LoginSocialPanelProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border border-border-default bg-bg-surface p-8 shadow-lg",
        "lg:flex lg:h-full lg:max-w-none lg:flex-col lg:justify-center lg:p-10",
        className,
      )}
    >
      <Heading as="h1" size="3xl" className={cn("font-semibold text-text-brand")}>
        Get started
      </Heading>
      <p className={cn("mt-2 text-sm text-text-muted")}>
        Welcome to {brandName} — sign in with a social account. We never store a password for this path.
      </p>

      {!!error && (
        <p className={cn("mt-3 text-sm text-red-600")} role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <div className={cn("mt-8")}>
        <SocialDivider />
      </div>

      <div className={cn("mt-6 flex items-center justify-center gap-4")} role="group" aria-label="Sign-in options">
        <button
          type="button"
          onClick={onGoogleClick}
          aria-label="Continue with Google"
          className={cn(
            "cursor-pointer",
            "inline-flex size-12 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-primary shadow-sm transition-colors",
            "hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
          )}
        >
          <GoogleLogoIcon className={cn("size-6")} weight="regular" aria-hidden />
        </button>

        <SocialComingSoonGlyph label="Facebook">
          <FacebookLogoIcon className={cn("size-6")} weight="regular" aria-hidden />
        </SocialComingSoonGlyph>

        <SocialComingSoonGlyph label="Apple">
          <AppleLogoIcon className={cn("size-6")} weight="regular" aria-hidden />
        </SocialComingSoonGlyph>
      </div>

      <p className={cn("mt-8 text-center text-xs text-text-muted")}>
        By continuing you agree to our{" "}
        <Link className={cn("text-text-brand underline underline-offset-2")} href="/terms">
          Terms
        </Link>{" "}
        and{" "}
        <Link className={cn("text-text-brand underline underline-offset-2")} href="/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
