import type { ReactNode } from "react";

import JobDetailsLayout from "@/modules/jobs/details/page/JobDetailsLayout";

export default function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  return <JobDetailsLayout params={params}>{children}</JobDetailsLayout>;
}
