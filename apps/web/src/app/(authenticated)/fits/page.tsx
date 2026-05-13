import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export function generateMetadata(): Metadata {
  return staticPageMetadata("Fit Analyses");
}

export { default } from "@/modules/fit-analyses/list/page/FitAnalysesPage";
