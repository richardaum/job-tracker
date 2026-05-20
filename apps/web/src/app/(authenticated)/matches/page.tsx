import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export function generateMetadata(): Metadata {
  return staticPageMetadata("Match Analyses");
}

export { default } from "@/modules/match-analyses/list/page/MatchAnalysesPage";
