import type { ReactNode } from "react";

import { ProfileShell } from "@/modules/profile/layout/page/ProfileShell";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <ProfileShell>{children}</ProfileShell>;
}
