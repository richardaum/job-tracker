#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  killTcpListenPorts,
  resolveListenPorts,
} from "./kill-tcp-listen-ports.ts";

const resetTag = "[pm2:reset]";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ecosystemAbs = path.join(root, "ecosystem.config.cjs");

function pm2(args: string[], allowFailure: boolean): void {
  const result = spawnSync("pm2", args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0 && !allowFailure) process.exit(1);
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
