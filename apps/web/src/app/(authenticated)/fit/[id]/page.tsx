import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return staticPageMetadata(`Fit Analysis — ${id.slice(0, 8)}`);
}

export { default } from "@/modules/applications/details/page/FitAnalysisPage";
