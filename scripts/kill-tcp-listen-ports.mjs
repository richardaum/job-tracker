#!/usr/bin/env node
/**
 * SIGKILL processes that are LISTEN on the given TCP ports (macOS/Linux: `lsof` + `kill`).
 *
 * Port list precedence: `PM2_RESET_PORTS` → `PORTS` → `KILL_PORTS`; if none set → 3100, 3101, 6006.
 *
 * CLI: `pnpm ports:kill` · `PORTS=3101 pnpm ports:kill`
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** @readonly */
const DEFAULT_PORTS = Object.freeze([3100, 3101, 6006]);

/**
 * @param {string} raw
 * @param {string} tag
 * @returns {readonly number[] | undefined} undefined → invalid input
 */
function parseCommaPorts(raw, tag) {
  const list = raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 65535);
  if (list.length === 0 && raw.trim().length > 0) {
    console.error(
      `${tag} Invalid port list (${JSON.stringify(raw)}); use comma-separated integers (default ${DEFAULT_PORTS.join(",")}).`,
    );
    return undefined;
  }
  return Object.freeze(list);
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {{ tag?: string }} [opts]
 */
export function resolveListenPorts(env, opts = {}) {
  const tag = opts.tag ?? "[ports:kill]";
  const explicit =
    env.PM2_RESET_PORTS?.trim() ||
    env.PORTS?.trim() ||
    env.KILL_PORTS?.trim() ||
    "";
  if (!explicit) return DEFAULT_PORTS;
  const parsed = parseCommaPorts(explicit, tag);
  if (!parsed) process.exit(1);
  return parsed;
}

/** @returns {readonly string[]} */
function pidsListeningOnTcpPort(port) {
  try {
    const out = execFileSync("lsof", ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    /** @type {Set<string>} */
    const uniq = new Set();
    for (const line of out.trim().split(/\n/))
      if (/^\d+$/.test(line)) uniq.add(line);
    return Object.freeze([...uniq]);
  } catch {
    return Object.freeze([]);
  }
}

/**
 * @param {readonly number[]} ports
 * @param {{ tag?: string }} [opts]
 */
export function killTcpListenPorts(ports, opts = {}) {
  const tag = opts.tag ?? "[ports:kill]";
  for (const port of ports) {
    const pids = pidsListeningOnTcpPort(port);
    for (const pid of pids) {
      try {
        execFileSync("kill", ["-9", pid], {
          stdio: ["ignore", "ignore", "pipe"],
        });
        console.warn(`${tag} SIGKILL PID ${pid} (LISTEN on TCP ${port}).`);
      } catch {
        // Process may already be gone.
      }
    }
  }
}

const selfResolved = path.resolve(fileURLToPath(import.meta.url));
const invokedDirectly =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === selfResolved;

if (invokedDirectly) {
  const tag = "[ports:kill]";
  const ports = resolveListenPorts(process.env, { tag });
  console.warn(`${tag} Clearing LISTEN on TCP ${ports.join(", ")} …`);
  killTcpListenPorts(ports, { tag });
}
