import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Resume details");

export { default } from "@/modules/resumes/details/page/ResumeDetailsPage";
