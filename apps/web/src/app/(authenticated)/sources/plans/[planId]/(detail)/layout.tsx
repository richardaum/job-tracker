import type { ReactNode } from "react";

import PlanDetailsLayout from "@/modules/sources/page/PlanDetailsLayout";

export default function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ planId: string }>;
}) {
  return <PlanDetailsLayout params={params}>{children}</PlanDetailsLayout>;
}
