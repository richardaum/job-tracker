import { type ReactNode, Suspense } from "react";

import { AuthenticatedShellDocument } from "@/gql/graphql";
import { PreloadQuery } from "@/lib/apollo-rsc";
import { AuthenticatedLayout } from "@/modules/navigation/layouts/AuthenticatedLayout";

/**
 * Next 16.3+: `useSearchParams` requires a **server** `Suspense` ancestor. Wrapping the
 * whole client shell (not only `{children}` inside it) satisfies the static check.
 */
export default function AuthenticatedSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PreloadQuery query={AuthenticatedShellDocument}>
      <Suspense fallback={null}>
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </Suspense>
    </PreloadQuery>
  );
}
