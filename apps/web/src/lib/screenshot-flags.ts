import { clientEnv } from "@/env/client";

/** Opt-in toggle for deterministic landing-page screenshot capture sessions. */
export const screenshotsEnabled = clientEnv.NEXT_PUBLIC_SCREENSHOTS_ENABLED;

/** What to hide while `screenshotsEnabled` is on, to keep screenshots deterministic. */
export const screenshotFlags = { hideAdminPanel: true, hideNextDevIndicator: true } as const;
