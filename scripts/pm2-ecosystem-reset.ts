#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  killTcpListenPorts,
  resolveListenPorts,
} from "./kill-tcp-listen-ports.ts";
import { isGitWorktreeCheckout, parseEnvFile } from "./worktree/lib.ts";

const resetTag = "[pm2:reset]";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ecosystemAbs = path.join(root, "ecosystem.config.cjs");

function loadWorktreeEnvIntoProcess(): void {
  const envPath = join(root, ".env.worktree");
  if (!existsSync(envPath)) return;
  const parsed = parseEnvFile(readFileSync(envPath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function pm2(args: string[], allowFailure: boolean): void {
  const result = spawnSync("pm2", args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0 && !allowFailure) process.exit(1);
}

loadWorktreeEnvIntoProcess();

if (isGitWorktreeCheckout(root) && !process.env.PM2_RESET_PORTS?.trim()) {
  console.error(
    `${resetTag} Refusing default port kill in a git worktree without PM2_RESET_PORTS.\n` +
      `${resetTag} Run pnpm worktree:setup or set PM2_RESET_PORTS in .env.worktree.`,
  );
  process.exit(1);
}

const ports = resolveListenPorts(process.env, { tag: resetTag });

console.warn("[pm2:reset] pm2 stop …");
pm2(["stop", ecosystemAbs], true);

console.warn(`[pm2:reset] Clearing LISTEN on TCP ${ports.join(", ")} …`);
killTcpListenPorts(ports, { tag: resetTag });

console.warn("[pm2:reset] pm2 delete …");
pm2(["delete", ecosystemAbs], true);

console.warn("[pm2:reset] pm2 start …");
pm2(["start", ecosystemAbs], false);
