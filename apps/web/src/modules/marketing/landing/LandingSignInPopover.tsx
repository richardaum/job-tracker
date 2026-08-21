"use client";

import { cn, Popover } from "@job-tracker/ui";
import { GoogleLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { getApiBaseUrl } from "@/lib/api-endpoints";

type LandingSignInPopoverProps = { triggerClassName: string };

/** A compact Google sign-in surface for the landing navigation. */
export function LandingSignInPopover({ triggerClassName }: LandingSignInPopoverProps) {
  const { safeReturnTo } = useAuthReturnTo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpenFromLogin = searchParams.get("signIn") === "open";

  const handleGoogleLogin = () => {
    // Full navigation to API origin for OAuth (not an in-app Next route).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${getApiBaseUrl()}/auth/google?returnTo=${encodeURIComponent(safeReturnTo)}`);
  };

  return (
    <Popover
      open={isOpenFromLogin ? true : undefined}
      onOpenChange={(open) => {
        if (!open && isOpenFromLogin) {
          router.replace("/");
        }
      }}
      trigger={
        <button type="button" className={triggerClassName}>
          Sign in
        </button>
      }
    >
      <section aria-label="Sign in" className={cn("w-72 p-3 sm:w-80")}>
        <h2 className={cn("text-base font-semibold text-text-primary")}>Sign in</h2>
        <p className={cn("mt-1.5 text-sm text-text-secondary")}>Continue with Google to start your pipeline.</p>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className={cn(
            "mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-border-brand px-4 py-2.5 text-sm font-semibold text-text-inverted transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
          )}
        >
          <GoogleLogoIcon className={cn("size-5")} weight="regular" aria-hidden />
          Continue with Google
        </button>
        <p className={cn("mt-4 text-xs/relaxed text-text-muted")}>
          By continuing, you agree to our{" "}
          <Link className={cn("text-text-brand underline underline-offset-2")} href="/terms">
            Terms
          </Link>{" "}
          and{" "}
          <Link className={cn("text-text-brand underline underline-offset-2")} href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </Popover>
  );
}
