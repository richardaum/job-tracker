import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Resume Detail");

export { default } from "@/modules/profile/resumes/[id]/page/ResumeDetailPage";
