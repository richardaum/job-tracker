import { cn } from "@job-tracker/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Terms of Service");

const LAST_UPDATED = "August 17, 2026";

export default function TermsPage() {
  return (
    <main className={cn("mx-auto w-full max-w-3xl px-6 py-16")}>
      <h1 className={cn("text-3xl font-semibold text-text-primary")}>Terms of Service</h1>
      <p className={cn("mt-2 text-sm text-text-muted")}>Last updated: {LAST_UPDATED}</p>

      <div className={cn("mt-10 space-y-8 text-sm/relaxed text-text-secondary")}>
        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>1. Acceptance of these terms</h2>
          <p className={cn("mt-2")}>
            NewJobTracker is a personal job-application tracking tool: a web app, a companion browser extension, and
            AI-assisted features that help you organize job listings, resumes, notes, and match analysis. By creating an
            account or using any part of the service, you agree to these terms and to our{" "}
            <Link className={cn("text-text-brand underline underline-offset-2")} href="/privacy">
              Privacy Policy
            </Link>
            . If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>2. Accounts and authentication</h2>
          <p className={cn("mt-2")}>
            You sign in with your Google account through OAuth. We do not receive or store your Google password. You are
            responsible for keeping access to that account secure — activity performed through your session is treated
            as authorized by you.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>3. Your content</h2>
          <p className={cn("mt-2")}>
            You retain ownership of the content you add — resumes, notes, job listings, work preferences, and any other
            data you enter or import via the browser extension. You grant us the limited right to store, process, and
            transmit that content solely to operate the service, including sending relevant portions to AI providers to
            generate match analyses, summaries, and note suggestions on your behalf.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>4. Acceptable use</h2>
          <p className={cn("mt-2")}>
            Use the service only for its intended purpose of managing your own job search. Do not attempt to access
            other users&apos; data, disrupt the service, or use it to store content you do not have the right to store.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>5. AI-generated content</h2>
          <p className={cn("mt-2")}>
            Match analyses, summaries, and note suggestions are generated automatically and may be inaccurate or
            incomplete. Review AI-generated content before relying on it for decisions about your job search.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>6. Availability and changes</h2>
          <p className={cn("mt-2")}>
            NewJobTracker is provided on an &quot;as is&quot; basis, without warranty of uninterrupted or error-free
            operation. Features may change, and the service may be modified or discontinued at any time.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>7. Termination</h2>
          <p className={cn("mt-2")}>
            You may stop using the service and request deletion of your account and data at any time. We may suspend or
            terminate access for use that violates these terms.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>8. Changes to these terms</h2>
          <p className={cn("mt-2")}>
            We may update these terms from time to time. Continued use of the service after an update constitutes
            acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>9. Contact</h2>
          <p className={cn("mt-2")}>
            Questions about these terms can be sent to{" "}
            <a className={cn("text-text-brand underline underline-offset-2")} href="mailto:richard.lopes92@gmail.com">
              richard.lopes92@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
