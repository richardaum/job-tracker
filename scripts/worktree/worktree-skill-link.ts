#!/usr/bin/env node

import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { tryRun } from "@job-tracker/try-run";

import {
  isGitWorktreeCheckout,
  linkWorktreeJobSkill,
  resolveMainWorktreeRoot,
  resolveWorktreeRoot,
} from "./worktree-lib.ts";

const tag = "[worktree:skill-link]";
const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

function fail(message: string): never {
  console.error(`${tag} ${message}`);
  process.exit(1);
}

function parseForce(argv: string[]): boolean {
  return argv.includes("--force");
}

function main(): void {
  if (!isGitWorktreeCheckout(root)) {
    fail(
      "Refusing to run on the main checkout. Create a git worktree first, then run from that path.",
    );
  }

  const worktreeRoot = resolveWorktreeRoot(root);
  if (!worktreeRoot) fail("Could not resolve worktree root.");

  const mainRoot = resolveMainWorktreeRoot(root);
  if (!mainRoot) {
    fail(
      "Could not resolve main worktree (source for .cursor/skills/worktree-job).",
    );
  }

  const force = parseForce(process.argv);
  const [linkErr, linkResult] = tryRun(() =>
    linkWorktreeJobSkill({ worktreeRoot, mainRoot, force }),
  );
  if (linkErr) {
    fail(linkErr.message);
  }

  const { source, linkPath, created } = linkResult!;

  if (created) {
    console.warn(`${tag} linked ${linkPath} → ${source}`);
  } else {
    console.warn(`${tag} ok ${linkPath} → ${source}`);
  }
}

main();
