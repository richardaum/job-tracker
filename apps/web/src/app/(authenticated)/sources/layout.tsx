"use client";

import { usePathname } from "next/navigation";

import { SourcesLayout } from "@/modules/sources/page/SourcesLayout";

export default function SourcesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRunsPage =
    pathname.includes("/template/") && pathname.endsWith("/runs");

  if (isRunsPage) {
    return <>{children}</>;
  }

  return <SourcesLayout>{children}</SourcesLayout>;
}
