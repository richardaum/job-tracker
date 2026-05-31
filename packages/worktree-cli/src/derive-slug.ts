import { spawnSync } from "node:child_process";
import path from "node:path";

function basenameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 16)
    .replace(/^-|-$/g, "");
}

function branchToSlug(branch: string): string {
  return basenameToSlug(branch.replace(/^refs\/heads\//, ""));
}

/**
 * Derives a kebab-case slug from the directory name.
 * Falls back to git branch when the directory is still named "job-tracker" (main checkout).
 * Returns "job-tracker" for the main checkout, meaning no worktree prefix is applied.
 */
export function deriveSlug(root: string): string {
  let slug = basenameToSlug(path.basename(root));

  if (slug === "job-tracker") {
    const result = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim() !== "HEAD") {
      slug = branchToSlug(result.stdout.trim());
    }
  }

  return slug;
}
