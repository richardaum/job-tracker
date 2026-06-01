import type { ReactNode } from "react";

import JobDetailsLayout from "@/modules/jobs/details/page/JobDetailsLayout";

type LayoutProps = { params: Promise<{ id: string }>; children: ReactNode };

export default function Layout({ children, params }: LayoutProps) {
  return <JobDetailsLayout params={params}>{children}</JobDetailsLayout>;
}
