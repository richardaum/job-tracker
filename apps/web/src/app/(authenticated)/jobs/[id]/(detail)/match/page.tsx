import type { Metadata } from "next";

import { generateJobDetailMetadata } from "@/modules/jobs/details/server/job-detail-metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return generateJobDetailMetadata(id, "Match");
}

export { default } from "@/modules/jobs/details/page/JobMatchRoutePage";
