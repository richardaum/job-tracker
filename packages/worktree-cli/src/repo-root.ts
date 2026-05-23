import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Monorepo root (directory containing apps/, packages/, pnpm-workspace.yaml). */
export function resolveRepoRoot(moduleUrl: string): string {
  return join(fileURLToPath(new URL(".", moduleUrl)), "../..");
}
