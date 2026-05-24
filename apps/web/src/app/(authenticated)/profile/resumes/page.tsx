import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Resumes");

export { default } from "@/modules/profile/resumes/page/ResumesTabPage";
