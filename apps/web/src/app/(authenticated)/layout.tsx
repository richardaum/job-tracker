import { type ReactNode, Suspense } from "react";

import { AuthenticatedShellDocument } from "@/gql/graphql";
import { PreloadQuery } from "@/lib/apollo-rsc";
import { AuthenticatedLayout } from "@/modules/navigation/layouts/AuthenticatedLayout";
import { WelcomeTourProvider } from "@/modules/welcome-tour/WelcomeTourProvider";

/**
 * Next 16.3+: `useSearchParams` requires a **server** `Suspense` ancestor. Wrapping the
 * whole client shell (not only `{children}` inside it) satisfies the static check.
 */
type AuthenticatedSegmentLayoutProps = { children: ReactNode };
export default function AuthenticatedSegmentLayout({ children }: AuthenticatedSegmentLayoutProps) {
  return (
    <PreloadQuery query={AuthenticatedShellDocument}>
      <Suspense fallback={null}>
        <WelcomeTourProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </WelcomeTourProvider>
      </Suspense>
    </PreloadQuery>
  );
}
