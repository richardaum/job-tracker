import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import type { BlockedKeyword } from "@api/domains/settings/keyword-blocker.types";
import { KeywordScopeEnum, MatchModeEnum } from "@api/domains/settings/keyword-blocker.types";
import { tryRun } from "@job-tracker/try-run";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...buildDataSourceOptions(process.env.DATABASE_URL!) }),
    TypeOrmModule.forFeature([UserSettingEntity]),
  ],
})
class ScriptModule {}

const SCOPE_MAP: Record<string, KeywordScopeEnum> = {
  TITLE: KeywordScopeEnum.Title,
  DESCRIPTION: KeywordScopeEnum.Description,
  COMPANY: KeywordScopeEnum.Company,
};

const MATCH_MODE_MAP: Record<string, MatchModeEnum> = { PARTIAL: MatchModeEnum.Partial, EXACT: MatchModeEnum.Exact };

function normalizeScope(val: string | null | undefined): KeywordScopeEnum | undefined {
  if (!val) return undefined;
  const upper = val.toUpperCase();
  return SCOPE_MAP[upper];
}

function normalizeMatchMode(val: string | null | undefined): MatchModeEnum | undefined {
  if (!val) return undefined;
  const upper = val.toUpperCase();
  return MATCH_MODE_MAP[upper];
}

function needsNormalization(bk: BlockedKeyword): boolean {
  if (bk.scope && bk.scope !== normalizeScope(bk.scope)) return true;
  if (bk.matchMode && bk.matchMode !== normalizeMatchMode(bk.matchMode)) return true;
  return false;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const prefix = dryRun ? "[DRY-RUN] " : "";

  process.stdout.write("Booting NestJS (PostgreSQL connection)...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, { logger: ["error", "warn"] });

  try {
    const em = app.get(EntityManager);
    const repo = em.getRepository(UserSettingEntity);

    const allSettings = await repo.find();

    const affected = allSettings.filter((s) => s.blockedKeywords?.length && s.blockedKeywords.some(needsNormalization));

    if (affected.length === 0) {
      process.stdout.write("No records need normalization. All values already match enum casing.\n");
      return;
    }

    process.stdout.write(`${prefix}Found ${affected.length} user setting(s) with non-normalized blocked keywords\n`);

    for (const s of affected) {
      const normalized = s.blockedKeywords!.map((bk) => {
        let changed = false;
        const scope = normalizeScope(bk.scope);
        if (scope && scope !== bk.scope) {
          bk = { ...bk, scope };
          changed = true;
        }
        const matchMode = normalizeMatchMode(bk.matchMode);
        if (matchMode && matchMode !== bk.matchMode) {
          bk = { ...bk, matchMode };
          changed = true;
        }
        return { bk, changed };
      });
      const changedCount = normalized.filter((n) => n.changed).length;

      if (dryRun) {
        process.stdout.write(
          `  ${prefix}User ${s.userId}: ${changedCount} of ${normalized.length} keyword(s) would be normalized\n`,
        );
      } else {
        s.blockedKeywords = normalized.map((n) => n.bk);
        const [err] = await tryRun(repo.save(s));
        if (err) {
          process.stdout.write(`  ❌ User ${s.userId}: ${err.message.slice(0, 120)}\n`);
        } else {
          process.stdout.write(`  ✓ User ${s.userId}: ${changedCount} of ${normalized.length} keyword(s) normalized\n`);
        }
      }
    }

    process.stdout.write(`\nDone. ${dryRun ? "(dry run — no changes applied)" : "All changes applied."}\n`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
