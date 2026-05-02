import { lstat, mkdir, rename, rm, symlink } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const sharedCommandFile = path.join(repoRoot, ".ai", "commands", "COMMIT.md");
const sharedSkillsDir = path.join(repoRoot, ".ai", "skills");

/** @type {readonly string[]} */
const commandLinkPaths = [
  path.join(repoRoot, ".agents", "commands", "COMMIT.md"),
  path.join(repoRoot, ".cursor", "commands", "COMMIT.md"),
  path.join(repoRoot, ".claude", "commands", "COMMIT.md"),
  path.join(repoRoot, ".gemini", "commands", "COMMIT.md"),
];

/** Lowercase symlink names used previously; kept for cleanup only. */
const legacyCommandSymlinks = [
  path.join(repoRoot, ".agents", "commands", "commit.md"),
  path.join(repoRoot, ".cursor", "commands", "commit.md"),
  path.join(repoRoot, ".claude", "commands", "commit.md"),
  path.join(repoRoot, ".gemini", "commands", "commit.md"),
];

/** Mirror `.ai/skills` into tooling-specific trees. */
const skillsLinkDirs = [
  path.join(repoRoot, ".agents", "skills"),
  path.join(repoRoot, ".cursor", "skills"),
  path.join(repoRoot, ".claude", "skills"),
  path.join(repoRoot, ".gemini", "skills"),
];

/** Skill lock files (Claude Code / agent installers); canonical copies under `.ai/`. */
const agentLockPairs = [
  {
    canonical: path.join(repoRoot, ".ai", ".skill-lock.json"),
    link: path.join(repoRoot, ".agents", ".skill-lock.json"),
  },
  {
    canonical: path.join(repoRoot, ".ai", ".skill-lock.json.backup"),
    link: path.join(repoRoot, ".agents", ".skill-lock.json.backup"),
  },
];

async function ensureFileSymlink(linkPath, targetAbsPath) {
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

  const relativeTarget = path.relative(path.dirname(linkPath), targetAbsPath);
  await symlink(relativeTarget, linkPath);
  console.log(`linked ${linkPath} -> ${relativeTarget}`);
}

async function ensureDirSymlink(linkPath, targetAbsDirPath) {
  await mkdir(path.dirname(linkPath), { recursive: true });

  try {
    const stats = await lstat(linkPath);
    if (stats.isSymbolicLink()) {
      await rm(linkPath);
    } else {
      throw new Error(
        `Skills path exists and is not a symlink (move content to .ai/skills first): ${linkPath}`,
      );
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
    targetAbsDirPath,
  );
  await symlink(relativeTarget, linkPath);
  console.log(`linked dir ${linkPath} -> ${relativeTarget}`);
}

async function migrateAgentsLockFile(linkPath, canonicalPath) {
  let linkStats;
  try {
    linkStats = await lstat(linkPath);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }

  if (linkStats.isSymbolicLink()) return;

  try {
    await lstat(canonicalPath);
    console.warn(
      `Skipped migrating ${linkPath}: canonical file already exists at ${canonicalPath}`,
    );
    return;
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

  if (linkStats.isFile()) {
    await rename(linkPath, canonicalPath);
    console.log(`migrated ${linkPath} -> ${canonicalPath}`);
  }
}

async function unlinkIfSymlink(candidatePath) {
  try {
    const stats = await lstat(candidatePath);
    if (stats.isSymbolicLink()) {
      await rm(candidatePath);
      console.log(`removed legacy symlink ${candidatePath}`);
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
}

async function main() {
  for (const { link, canonical } of agentLockPairs) {
    await migrateAgentsLockFile(link, canonical);
  }

  for (const p of legacyCommandSymlinks) {
    await unlinkIfSymlink(p);
  }

  await Promise.all([
    ...commandLinkPaths.map((linkPath) =>
      ensureFileSymlink(linkPath, sharedCommandFile),
    ),
    ...skillsLinkDirs.map((linkDir) =>
      ensureDirSymlink(linkDir, sharedSkillsDir),
    ),
    ...agentLockPairs.map(({ canonical, link }) =>
      ensureFileSymlink(link, canonical),
    ),
  ]);

  console.log("AI command + skill symlinks are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
