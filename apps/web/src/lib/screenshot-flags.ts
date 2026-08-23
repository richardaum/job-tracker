// Reads process.env directly (not the `@/env/client` wrapper): this module is also required
// from next.config.ts, whose next-config-ts transpiler resolves neither the `@/` tsconfig
// alias nor `..` relative imports (blocked by lint) the same way the app bundle does.

/** Opt-in toggle for deterministic landing-page screenshot capture sessions. */
// eslint-disable-next-line no-restricted-properties -- shared with next.config.ts, see note above
export const screenshotsEnabled = process.env.NEXT_PUBLIC_SCREENSHOTS_ENABLED === "true";

/** What to hide while `screenshotsEnabled` is on, to keep screenshots deterministic. */
export const screenshotFlags = { hideAdminPanel: true, hideNextDevIndicator: true } as const;
