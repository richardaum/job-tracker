import type { ReactNode } from "react";
import { PortalSlotsProvider } from "react-portalslots";

import { ProfileHeaderActions } from "@/modules/profile/layout/profile-header.slots";

type ProfileHeaderSlotsTestWrapperProps = { children: ReactNode };
export function ProfileHeaderSlotsTestWrapper({
  children,
}: ProfileHeaderSlotsTestWrapperProps) {
  return (
    <PortalSlotsProvider>
      <ProfileHeaderActions.Slot />
      {children}
    </PortalSlotsProvider>
  );
}
