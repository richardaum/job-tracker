import type { ReactNode } from "react";

import PlanDetailsLayout from "@/modules/sources/page/PlanDetailsLayout";

type LayoutProps = { params: Promise<{ planId: string }>; children: ReactNode };

export default function Layout({ children, params }: LayoutProps) {
  return <PlanDetailsLayout params={params}>{children}</PlanDetailsLayout>;
}
