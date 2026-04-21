import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const hooksPath = resolve(process.cwd(), "src/gql/hooks.ts");

const original = readFileSync(hooksPath, "utf8");
const cleaned = original
  // Remove ts-ignore comment used by generated suspense overloads.
  .replace(/^\s*\/\/ @ts-ignore\s*$/gm, "")
  // Remove generated suspense overloads/implementation blocks that are
  // currently incompatible with Next.js typecheck in this setup.
  .replace(
    /export function use\w+SuspenseQuery[\s\S]*?(?=export type \w+QueryHookResult)/gm,
    "",
  )
  .replace(/^\s*export type \w+SuspenseQueryHookResult.*$/gm, "")
  .replace(/^\s*export type \w+QueryResult.*$/gm, "");

writeFileSync(hooksPath, cleaned, "utf8");
