import type { ReactNode } from "react";
import { PortalSlotsProvider } from "react-portalslots";

import { ProfileHeaderActions } from "@/modules/profile/layout/profile-header.slots";

export function ProfileHeaderSlotsTestWrapper({ children }: { children: ReactNode }) {
  return (
    <PortalSlotsProvider>
      <ProfileHeaderActions.Slot />
      {children}
    </PortalSlotsProvider>
  );
}
