#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "src/database/migrations");

function parseArgs(argv) {
  const args = {
    name: "baseline-squashed",
    timestamp: Date.now(),
    from: undefined,
    to: undefined,
    write: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--help" || value === "-h") args.help = true;
    else if (value === "--write" || value === "-w") args.write = true;
    else if (value === "--name") args.name = argv[++i];
    else if (value === "--timestamp") args.timestamp = Number(argv[++i]);
    else if (value === "--from") args.from = argv[++i];
    else if (value === "--to") args.to = argv[++i];
    else throw new Error(`Unknown argument: ${value}`);
  }

  if (!Number.isFinite(args.timestamp) || args.timestamp <= 0) {
    throw new Error("Invalid --timestamp. Provide a valid positive integer.");
  }
  return args;
}

function printHelp() {
  console.log(
    [
      "Usage:",
      "  pnpm run db:migrate:squash -- [options]",
      "",
      "Options:",
      "  --name <slug>         Output migration file slug (default: baseline-squashed)",
      "  --timestamp <number>  Output migration timestamp (default: Date.now())",
      "  --from <filename>     Start from migration filename (inclusive)",
      "  --to <filename>       End at migration filename (inclusive)",
      "  --write, -w           Write the squashed migration file",
      "  --help, -h            Show this help",
      "",
      "Notes:",
      "  - This script concatenates existing up() bodies in timestamp order.",
      "  - It does not delete old migrations or rewrite index.ts automatically.",
      "  - Keep old migrations until all existing environments are baselined.",
    ].join("\n"),
  );
}

function toClassBaseName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function extractUpBody(source, fileName) {
  const marker = "public async up(queryRunner: QueryRunner): Promise<void> {";
  const start = source.indexOf(marker);
  if (start < 0) {
    throw new Error(`Could not find up() method in ${fileName}`);
  }

  let i = start + marker.length;
  let depth = 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    i += 1;
  }

  if (depth !== 0) {
    throw new Error(`Unbalanced braces while parsing up() in ${fileName}`);
  }

  return source.slice(start + marker.length, i - 1).trim();
}

function betweenRange(files, from, to) {
  let start = 0;
  let end = files.length - 1;

  if (from) {
    const idx = files.indexOf(from);
    if (idx === -1) throw new Error(`--from file not found: ${from}`);
    start = idx;
  }
  if (to) {
    const idx = files.indexOf(to);
    if (idx === -1) throw new Error(`--to file not found: ${to}`);
    end = idx;
  }
  if (start > end) {
    throw new Error("--from must come before --to");
  }

  return files.slice(start, end + 1);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const allEntries = await fs.readdir(MIGRATIONS_DIR);
  const files = allEntries
    .filter((name) => /^\d{13,}-.*\.ts$/.test(name))
    .sort((a, b) => a.localeCompare(b, "en"));

  if (files.length === 0) {
    throw new Error(`No migration files found in ${MIGRATIONS_DIR}`);
  }

  const selected = betweenRange(files, args.from, args.to);
  const snippets = [];
  for (const fileName of selected) {
    const filePath = path.join(MIGRATIONS_DIR, fileName);
    const source = await fs.readFile(filePath, "utf8");
    const upBody = extractUpBody(source, fileName);
    snippets.push({ fileName, upBody });
  }

  const classBase = toClassBaseName(args.name);
  const className = `${classBase}${args.timestamp}`;
  const outputFile = `${args.timestamp}-${args.name}.ts`;
  const outputPath = path.join(MIGRATIONS_DIR, outputFile);
  const upBodyJoined = snippets
    .map(
      (entry) =>
        `    // from ${entry.fileName}\n${entry.upBody
          .split("\n")
          .map((line) => `    ${line}`)
          .join("\n")}`,
    )
    .join("\n\n");

  const fileContent = `import type { MigrationInterface, QueryRunner } from "typeorm";

export class ${className} implements MigrationInterface {
  name = "${className}";

  public async up(queryRunner: QueryRunner): Promise<void> {
${upBodyJoined}
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally empty: squashed baseline migration is not reversible.
  }
}
`;

  console.log(`[migrate:squash] selected ${selected.length} migration(s):`);
  for (const name of selected) console.log(`- ${name}`);
  console.log(`[migrate:squash] output file: ${outputFile}`);

  if (!args.write) {
    console.log(
      "[migrate:squash] dry-run only. Re-run with --write to create file.",
    );
    return;
  }

  await fs.writeFile(outputPath, fileContent, "utf8");
  console.log(`[migrate:squash] wrote ${outputPath}`);
  console.log(
    "[migrate:squash] next: update src/database/migrations/index.ts and validate on a clean database.",
  );
}

run().catch((err) => {
  console.error(`[migrate:squash] ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
