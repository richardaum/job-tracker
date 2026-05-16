#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORTS: readonly number[] = [3100, 3101, 6006];

function parseCommaPorts(
  raw: string,
  tag: string,
): readonly number[] | undefined {
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
  return list;
}

export function resolveListenPorts(
  env: NodeJS.ProcessEnv,
  opts?: { tag?: string },
): readonly number[] {
  const tag = opts?.tag ?? "[ports:kill]";
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

function pidsListeningOnTcpPort(port: number): readonly string[] {
  try {
    const out = execFileSync("lsof", ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const uniq = new Set<string>();
    for (const line of out.trim().split(/\n/))
      if (/^\d+$/.test(line)) uniq.add(line);
    return [...uniq];
  } catch {
    return [];
  }
}

export function killTcpListenPorts(
  ports: readonly number[],
  opts?: { tag?: string },
): void {
  const tag = opts?.tag ?? "[ports:kill]";
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
