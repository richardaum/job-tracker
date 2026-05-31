import path from "node:path";
import { fileURLToPath } from "node:url";

import ecosystemConfig from "./ecosystem.config.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export { ecosystemConfig };

/** Absolute path to the PM2 ecosystem bootstrap (`ecosystem.config.cjs` loads TS via tsx). */
export const ecosystemConfigPath = path.join(repoRoot, "ecosystem.config.cjs");

/** PM2 only recognizes ecosystem files by extension — no extra interpreter args needed. */
export const ecosystemPm2Args = [] as const;
