import type { ReactNode } from "react";

import { ProfileShell } from "@/modules/profile/layout/page/ProfileShell";

type ProfileLayoutProps = { children: ReactNode };
export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <ProfileShell>{children}</ProfileShell>;
}
