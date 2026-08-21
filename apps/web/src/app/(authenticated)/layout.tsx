import { type ReactNode, Suspense } from "react";

import { AuthenticatedShellDocument } from "@/gql/graphql";
import { PreloadQuery } from "@/lib/apollo-rsc";
import { getPostHogDistinctId, getServerFeatureFlag } from "@/lib/posthog-server";
import { QUICK_TIPS_FEATURE_FLAG } from "@/modules/navigation/components/quick-tips.shared";
import { AuthenticatedLayout } from "@/modules/navigation/layouts/AuthenticatedLayout";
import { WelcomeTourProvider } from "@/modules/welcome-tour/WelcomeTourProvider";

/**
 * Next 16.3+: `useSearchParams` requires a **server** `Suspense` ancestor. Wrapping the
 * whole client shell (not only `{children}` inside it) satisfies the static check.
 */
type AuthenticatedSegmentLayoutProps = { children: ReactNode };
export default async function AuthenticatedSegmentLayout({ children }: AuthenticatedSegmentLayoutProps) {
  const distinctId = await getPostHogDistinctId();
  const quickTipsEnabled = await getServerFeatureFlag(QUICK_TIPS_FEATURE_FLAG, distinctId);

  return (
    <PreloadQuery query={AuthenticatedShellDocument}>
      <Suspense fallback={null}>
        <WelcomeTourProvider>
          <AuthenticatedLayout quickTipsEnabled={quickTipsEnabled}>{children}</AuthenticatedLayout>
        </WelcomeTourProvider>
      </Suspense>
    </PreloadQuery>
  );
}
