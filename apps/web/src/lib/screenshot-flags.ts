type ScreenshotEnvironment = "development" | "production" | "test";

/** Controls for deterministic landing-page screenshots. */
export const screenshotFlags = { hideAdminPanel: true, hideNextDevIndicator: true } as const;

export function areScreenshotFlagsEnabled(environment: ScreenshotEnvironment) {
  return environment === "development";
}
