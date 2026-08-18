"use client";

import { cn } from "@job-tracker/ui";
import { ArrowRightIcon, GoogleLogoIcon, LockIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { APP_TITLE } from "@/app/metadata";
import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";

import { PipelineRail } from "./PipelineRail";

const features = [
  {
    stage: "Draft",
    title: "Paste a link, get a draft",
    body: "Drop in a job posting URL. NewJobTracker pulls the title, company, and details, and starts your application.",
  },
  {
    stage: "Applied",
    title: "Never miss a follow-up",
    body: "Reminders track each application through recruiter screens and interviews, so nothing goes quiet by accident.",
  },
  {
    stage: "Technical",
    title: "AI scores your fit",
    body: "See exactly which requirements you match, which are gaps, and which are unclear — with quotes, not guesses.",
  },
  {
    stage: "Offer",
    title: "Compare offers instantly",
    body: "Put two offers side by side, adjusted for currency and location, and see which one actually wins.",
  },
];

type PrimaryCtaProps = { className?: string; dark?: boolean };

/** Signed-in visitors get a link straight to their jobs; everyone else gets the Google sign-in button. */
function PrimaryCta({ className, dark }: PrimaryCtaProps) {
  const { user, loading } = useCurrentUser();
  const { safeReturnTo } = useAuthReturnTo();

  const handleGoogleLogin = () => {
    // Full navigation to API origin for OAuth (not an in-app Next route).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${getApiBaseUrl()}/auth/google?returnTo=${encodeURIComponent(safeReturnTo)}`);
  };

  const sharedClasses = cn(
    "inline-flex cursor-pointer items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
    dark
      ? "bg-bg-surface text-text-primary hover:bg-bg-surface-hover"
      : "bg-(--color-border-brand) text-text-inverted hover:opacity-90",
    className,
  );

  if (!loading && user) {
    return (
      <Link href="/jobs" className={sharedClasses}>
        Go to your jobs
        <ArrowRightIcon className={cn("size-4")} aria-hidden />
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleGoogleLogin} className={sharedClasses}>
      <GoogleLogoIcon className={cn("size-5")} weight="regular" aria-hidden />
      Sign in with Google
    </button>
  );
}

export function LandingPage() {
  return (
    <main className={cn("text-text-primary")}>
      <div className={cn("mx-auto w-full max-w-6xl px-6")}>
        <nav className={cn("flex items-center justify-between py-6")}>
          <span className={cn("flex items-center gap-2.5 text-sm font-semibold")}>
            <AppBrandMark size={30} className={cn("rounded-lg")} />
            {APP_TITLE}
          </span>
          <PrimaryCta dark className={cn("border border-border-default px-4 py-2 text-xs")} />
        </nav>
      </div>

      <header className={cn("pt-10 pb-16 sm:pt-14 sm:pb-24")}>
        <div className={cn("mx-auto w-full max-w-6xl px-6")}>
          <p
            className={cn(
              "mb-5 flex w-fit items-center gap-2 rounded-full bg-bg-success-subtle px-3 py-1 text-xs font-medium text-(--primitive-color-green-700)",
            )}
          >
            <span className={cn("size-1.5 rounded-full bg-current")} aria-hidden />
            Free · bring your own AI key
          </p>
          <h1 className={cn("max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl")}>
            One link in. <span className={cn("text-text-brand")}>One pipeline</span> to the offer.
          </h1>
          <p className={cn("mt-6 max-w-xl text-lg text-text-secondary")}>
            Paste a job posting and {APP_TITLE} drafts the application, scores your fit against your resume, and carries
            it through every stage to a signed offer — running on your own AI key, not ours.
          </p>
          <div className={cn("mt-8 flex flex-wrap items-center gap-4")}>
            <PrimaryCta />
            <span className={cn("text-xs text-text-muted")}>
              No card. No subscription. Your OpenAI key, your usage.
            </span>
          </div>

          <div className={cn("mt-16 sm:mt-20")}>
            <PipelineRail />
          </div>
        </div>
      </header>

      <section className={cn("border-t border-border-default py-16 sm:py-24")}>
        <div
          className={cn(
            "mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]",
          )}
        >
          <div>
            <h2 className={cn("mb-5 text-3xl font-semibold tracking-tight text-balance")}>
              Your key. Your data. Your control.
            </h2>
            <p className={cn("mb-4 text-base text-text-secondary")}>
              Every AI feature in {APP_TITLE} — drafting, fit scoring, offer summaries — runs on{" "}
              <strong className={cn("text-text-primary")}>your own OpenAI API key</strong>, stored encrypted and used
              only for your requests. We never route your resume or job data through a shared AI subscription.
            </p>
            <p className={cn("text-base text-text-secondary")}>
              You see exactly what it costs, because you&apos;re paying the AI provider directly — not a markup baked
              into a monthly plan.
            </p>
          </div>

          <div className={cn("rounded-2xl bg-(--color-border-brand) p-7 text-text-inverted shadow-sm")}>
            <p
              className={cn(
                "mb-4 flex items-center gap-1.5 text-xs font-medium tracking-wide text-text-inverted/60 uppercase",
              )}
            >
              <LockIcon className={cn("size-3.5")} aria-hidden />
              AI settings
            </p>
            {[
              ["Provider", "OpenAI"],
              ["API key", "sk-••••••••••••4f2a"],
              ["Stored", "Encrypted, per-account"],
              ["Used for", "Your requests only"],
            ].map(([label, value]) => (
              <div
                key={label}
                className={cn(
                  "flex items-center justify-between border-b border-white/10 py-3 text-sm last:border-b-0",
                )}
              >
                <span className={cn("text-text-inverted/60")}>{label}</span>
                <span className={cn("font-mono text-text-inverted")}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("border-t border-border-default py-16 sm:py-24")}>
        <div className={cn("mx-auto w-full max-w-6xl px-6")}>
          <div className={cn("mb-11 max-w-xl")}>
            <h2 className={cn("mb-3 text-3xl font-semibold tracking-tight text-balance")}>
              Four things it actually does
            </h2>
            <p className={cn("text-base text-text-secondary")}>
              Each one maps to a real stage on the pipeline above — not a marketing promise.
            </p>
          </div>
          <div
            className={cn(
              "grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border-default bg-border-default sm:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {features.map((feature) => (
              <div key={feature.title} className={cn("flex flex-col gap-3 bg-bg-surface p-6")}>
                <span className={cn("text-xs font-medium tracking-wide text-text-brand uppercase")}>
                  → {feature.stage}
                </span>
                <h3 className={cn("text-base/snug font-semibold text-text-primary")}>{feature.title}</h3>
                <p className={cn("text-sm text-text-secondary")}>{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("py-16 sm:py-24")}>
        <div className={cn("mx-auto w-full max-w-6xl px-6")}>
          <div className={cn("rounded-3xl bg-bg-brand-strong px-8 py-16 text-center text-text-inverted sm:px-16")}>
            <h2 className={cn("mx-auto max-w-2xl text-3xl font-semibold tracking-wide text-balance")}>
              Stop tracking your search in a spreadsheet.
            </h2>
            <p className={cn("mx-auto mt-4 max-w-md text-base text-text-inverted/70")}>
              Free to use. Bring your own AI key. Sign in and paste your first link.
            </p>
            <div className={cn("mt-8 flex flex-col items-center gap-3")}>
              <PrimaryCta dark />
              <span className={cn("text-xs text-text-inverted/50")}>Takes under a minute.</span>
            </div>
          </div>
        </div>
      </section>

      <div className={cn("mx-auto w-full max-w-6xl px-6")}>
        <footer
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-t border-border-default py-8 text-xs text-text-muted",
          )}
        >
          <span>© 2026 {APP_TITLE}</span>
          <div className={cn("flex gap-5")}>
            <Link className={cn("hover:text-text-brand")} href="/terms">
              Terms
            </Link>
            <Link className={cn("hover:text-text-brand")} href="/privacy">
              Privacy
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
