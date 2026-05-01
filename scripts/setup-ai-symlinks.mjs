import { lstat, mkdir, rm, symlink } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const sharedCommandFile = path.join(repoRoot, ".ai", "commands", "commit.md");

const links = [
  path.join(repoRoot, ".cursor", "commands", "commit.md"),
  path.join(repoRoot, ".claude", "commands", "commit.md"),
  path.join(repoRoot, ".gemini", "commands", "commit.md"),
];

async function ensureSymlink(linkPath) {
  await mkdir(path.dirname(linkPath), { recursive: true });

  try {
    const stats = await lstat(linkPath);
    if (stats.isSymbolicLink()) {
      await rm(linkPath);
    } else {
      throw new Error(`Cannot replace non-symlink path: ${linkPath}`);
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }

  const relativeTarget = path.relative(
    path.dirname(linkPath),
    sharedCommandFile,
  );
  await symlink(relativeTarget, linkPath);
  console.log(`linked ${linkPath} -> ${relativeTarget}`);
}

async function main() {
  await Promise.all(links.map(ensureSymlink));
  console.log("AI command symlinks are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
