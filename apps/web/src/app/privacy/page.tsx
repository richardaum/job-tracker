import { cn } from "@job-tracker/ui";
import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Privacy Policy");

const LAST_UPDATED = "August 17, 2026";

export default function PrivacyPage() {
  return (
    <main className={cn("mx-auto w-full max-w-3xl px-6 py-16")}>
      <h1 className={cn("text-3xl font-semibold text-text-primary")}>Privacy Policy</h1>
      <p className={cn("mt-2 text-sm text-text-muted")}>Last updated: {LAST_UPDATED}</p>

      <div className={cn("mt-10 space-y-8 text-sm/relaxed text-text-secondary")}>
        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>1. Data we collect</h2>
          <p className={cn("mt-2")}>The following data is collected and stored to operate NewJobTracker:</p>
          <div className={cn("mt-4 overflow-x-auto")}>
            <table className={cn("w-full border-collapse text-left text-xs")}>
              <thead>
                <tr className={cn("border-b border-border-default text-text-muted")}>
                  <th className={cn("py-2 pr-4 font-medium")}>Area</th>
                  <th className={cn("py-2 pr-4 font-medium")}>Data</th>
                  <th className={cn("py-2 font-medium")}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className={cn("border-b border-border-default")}>
                  <td className={cn("py-2 pr-4")}>Authentication</td>
                  <td className={cn("py-2 pr-4")}>Name, email, avatar (via Google OAuth)</td>
                  <td className={cn("py-2")}>Sign-in and account identification</td>
                </tr>
                <tr className={cn("border-b border-border-default")}>
                  <td className={cn("py-2 pr-4")}>Resumes</td>
                  <td className={cn("py-2 pr-4")}>Full name, work history, education, skills</td>
                  <td className={cn("py-2")}>Job match analysis</td>
                </tr>
                <tr className={cn("border-b border-border-default")}>
                  <td className={cn("py-2 pr-4")}>Work preferences</td>
                  <td className={cn("py-2 pr-4")}>Remote/location, salary, and other preferences</td>
                  <td className={cn("py-2")}>Personalizing match analysis</td>
                </tr>
                <tr className={cn("border-b border-border-default")}>
                  <td className={cn("py-2 pr-4")}>Applications</td>
                  <td className={cn("py-2 pr-4")}>Target companies, roles, stages, notes</td>
                  <td className={cn("py-2")}>Job search tracking</td>
                </tr>
                <tr className={cn("border-b border-border-default")}>
                  <td className={cn("py-2 pr-4")}>Salary</td>
                  <td className={cn("py-2 pr-4")}>Salary expectations, currency</td>
                  <td className={cn("py-2")}>Salary calculation and conversion</td>
                </tr>
                <tr>
                  <td className={cn("py-2 pr-4")}>Browser extension</td>
                  <td className={cn("py-2 pr-4")}>Visited job listing URLs, company, role</td>
                  <td className={cn("py-2")}>Automatic job import</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={cn("mt-4")}>
            We do not intentionally collect sensitive personal data (racial origin, religious beliefs, health data,
            etc.). If you voluntarily include such information in a free-text field like a resume, it is stored with the
            same protections as the rest of your content.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>2. How we use your data</h2>
          <p className={cn("mt-2")}>
            Data is used to run the core features you use directly — tracking applications, generating match analyses,
            calculating salary conversions, and importing job listings via the browser extension. Portions of your
            resume, job listings, and notes may be sent to third-party AI providers to generate match analyses,
            summaries, and note suggestions. We also use PostHog for product analytics and feature-flagging, which may
            process usage events tied to your account.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>3. Legal basis</h2>
          <p className={cn("mt-2")}>
            Authentication and core application-tracking data are processed under legitimate interest and contract
            execution (providing the service you signed up for). Resume, work-preference, salary, and browser-extension
            data are processed based on your consent, given by actively adding that data to the app or installing and
            using the extension.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>4. Data retention</h2>
          <p className={cn("mt-2")}>
            We retain your data for as long as your account is active. If you request account deletion, we delete your
            personal data within a reasonable period, except where retention is required to comply with legal
            obligations.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>5. Your rights</h2>
          <p className={cn("mt-2")}>
            Depending on your jurisdiction (including Brazil&apos;s LGPD and the EU&apos;s GDPR), you may have the right
            to access, correct, delete, or export your personal data, and to withdraw consent for specific processing
            purposes at any time. To exercise any of these rights, contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>6. Security</h2>
          <p className={cn("mt-2")}>
            We apply reasonable technical and administrative measures to protect your data, including encryption of
            sensitive fields at rest and access controls limiting who can view your information. No system is fully
            immune to risk, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>7. Third parties</h2>
          <p className={cn("mt-2")}>
            We share data with the minimum set of third parties needed to run the service: Google (OAuth sign-in), AI
            providers (match analysis and text generation), and PostHog (product analytics). We do not sell your
            personal data.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>8. Changes to this policy</h2>
          <p className={cn("mt-2")}>
            We may update this policy as the product evolves. Material changes will be reflected by updating the
            &quot;Last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className={cn("text-lg font-semibold text-text-primary")}>9. Contact</h2>
          <p className={cn("mt-2")}>
            Questions about this policy or requests regarding your data can be sent to{" "}
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
