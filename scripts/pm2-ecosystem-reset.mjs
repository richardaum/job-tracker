#!/usr/bin/env node
/**
 * 1. `pm2 stop` apps declared in `ecosystem.config.cjs`
 * 2. SIGKILL any remaining LISTEN sockets on dev TCP ports (orphans / races)
 * 3. `pm2 delete` those apps from the daemon
 * 4. `pm2 start` the ecosystem again
 *
 * Ports: shared with `pnpm ports:kill` — see `scripts/kill-tcp-listen-ports.mjs`.
 *
 * Requires `lsof` + `kill` (macOS/Linux).
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  killTcpListenPorts,
  resolveListenPorts,
} from "./kill-tcp-listen-ports.mjs";

const resetTag = "[pm2:reset]";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ecosystemAbs = path.join(root, "ecosystem.config.cjs");

/** @param {boolean} allowFailure */
function pm2(args, allowFailure) {
  try {
    execFileSync("pm2", args, { cwd: root, stdio: "inherit" });
  } catch {
    if (!allowFailure) process.exit(1);
  }
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
