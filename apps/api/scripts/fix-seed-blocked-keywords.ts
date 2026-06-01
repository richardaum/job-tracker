import "reflect-metadata";
import "dotenv/config";

import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import type { BlockedKeyword } from "@api/domains/settings/keyword-blocker.types";
import type { LegacyKeyword } from "@api/domains/settings/keyword-mapper";
import { tryMapLegacyKeyword } from "@api/domains/settings/keyword-mapper";
import { tryRun } from "@job-tracker/try-run";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

const LEGACY_DB_PATH = "/Users/richardaum/projects/linkedin/linkedin_jobs.db";

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...buildDataSourceOptions(process.env.DATABASE_URL!) }),
    TypeOrmModule.forFeature([UserSettingEntity]),
  ],
})
class ScriptModule {}

function readLegacyKeywords(dbPath: string): LegacyKeyword[] {
  const db = new DatabaseSync(dbPath, { readOnly: true, allowExtension: false });
  try {
    const stmt = db.prepare("SELECT keyword, type FROM forbidden_keywords ORDER BY id");
    const rows = stmt.all() as { keyword: string; type: string }[];
    return rows;
  } finally {
    db.close();
  }
}

function buildSummary(legacyKeywords: LegacyKeyword[]): string {
  const counts: Record<string, number> = {};
  for (const lk of legacyKeywords) {
    counts[lk.type] = (counts[lk.type] ?? 0) + 1;
  }
  const total = legacyKeywords.length;
  const parts = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => `${type}: ${count}`);
  return `Total: ${total} legacy keyword(s) [${parts.join(", ")}]`;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const userIdIndex = process.argv.indexOf("--user-id");
  const targetUserId =
    userIdIndex >= 0 && userIdIndex + 1 < process.argv.length ? process.argv[userIdIndex + 1] : undefined;

  if (!targetUserId) {
    console.error("ERROR: --user-id <uuid> is required");
    process.exit(1);
  }

  const prefix = dryRun ? "[DRY-RUN] " : "";

  process.stdout.write("Connecting to legacy SQLite database...\n");
  if (!existsSync(LEGACY_DB_PATH)) {
    console.error(`ERROR: Legacy SQLite database not found at ${LEGACY_DB_PATH}`);
    process.exit(1);
  }
  const legacyKeywords = readLegacyKeywords(LEGACY_DB_PATH);

  if (legacyKeywords.length === 0) {
    process.stdout.write("No legacy keywords found. Nothing to do.\n");
    process.exit(0);
  }

  process.stdout.write(`Found ${legacyKeywords.length} legacy keyword(s)\n`);
  process.stdout.write(`  ${buildSummary(legacyKeywords)}\n`);

  const mappedKeywords: BlockedKeyword[] = [];
  for (const lk of legacyKeywords) {
    const result = tryMapLegacyKeyword(lk);
    if (result.ok) {
      mappedKeywords.push(result.value);
    } else {
      process.stdout.write(`  ⚠ Skipping legacy keyword "${lk.keyword}" (type: "${lk.type}"): ${result.error}\n`);
    }
  }

  process.stdout.write(
    `Mapped ${mappedKeywords.length} keyword(s) (${legacyKeywords.length - mappedKeywords.length} skipped)\n`,
  );

  process.stdout.write("Booting NestJS (PostgreSQL connection)...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, { logger: ["error", "warn"] });

  try {
    const em = app.get(EntityManager);
    const repo = em.getRepository(UserSettingEntity);

    process.stdout.write(
      `${prefix}Upserting ${mappedKeywords.length} blocked keyword(s) into user ${targetUserId}...\n`,
    );

    if (dryRun) {
      process.stdout.write("\n[DRY-RUN] Would insert:\n");
      for (const bk of mappedKeywords) {
        process.stdout.write(`  keyword="${bk.keyword}" scope=${bk.scope} matchMode=${bk.matchMode}\n`);
      }
      process.stdout.write(
        `\n[DRY-RUN] Summary for user ${targetUserId}: ${mappedKeywords.length} keyword(s) would be upserted\n`,
      );
    } else {
      let settings = await repo.findOne({ where: { userId: targetUserId } });
      if (!settings) {
        settings = repo.create({ userId: targetUserId, blockedKeywords: [] });
        process.stdout.write(`  Creating new settings record for user...\n`);
      }

      const existingSet = new Set(
        (settings.blockedKeywords ?? []).map((bk) => `${bk.keyword}|${bk.scope}|${bk.matchMode}`),
      );
      const newOnes = mappedKeywords.filter((bk) => !existingSet.has(`${bk.keyword}|${bk.scope}|${bk.matchMode}`));

      if (newOnes.length === 0) {
        process.stdout.write(`  All ${mappedKeywords.length} keyword(s) already exist. Nothing to add.\n`);
      } else {
        settings.blockedKeywords = [...(settings.blockedKeywords ?? []), ...newOnes];
        const [err] = await tryRun(repo.save(settings));
        if (err) {
          console.error(`  ❌ Failed to save settings: ${err.message}`);
          process.exit(1);
        }
        process.stdout.write(
          `  ✓ Added ${newOnes.length} new keyword(s) (${mappedKeywords.length - newOnes.length} already existed)\n`,
        );
      }

      process.stdout.write(
        `\nDone. User ${targetUserId} now has ${settings.blockedKeywords.length} blocked keyword(s).\n`,
      );
    }
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
