import { PortalSlot } from "react-portalslots";

export const JobHeaderActions = PortalSlot("job-header-actions");

/** Actions dropdown items (Match section, etc.) use the Radix outlet in `job-details-actions-menu.tsx`, not a portal slot here. */
