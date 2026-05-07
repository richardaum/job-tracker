import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";
import DraftApplicationPage from "@/modules/draft-applications/detail/page/DraftApplicationPage";

export const metadata: Metadata = staticPageMetadata("Draft application");

export default async function DraftApplicationRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DraftApplicationPage draftId={id} />;
}
