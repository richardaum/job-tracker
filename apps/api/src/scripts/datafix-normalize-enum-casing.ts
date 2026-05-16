import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { tryRun } from "@job-tracker/try-run";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(process.env.DATABASE_URL!),
    }),
  ],
})
class NormalizeModule {}

interface EnumFix {
  label: string;
  selectQuery: string;
  updateQuery: string;
}

const JSONB_FIXES: EnumFix[] = [
  {
    label: "summary_metadata -> status (lower -> UPPER)",
    selectQuery: `
      SELECT count(*)::text AS cnt FROM applications
      WHERE summary_metadata IS NOT NULL
        AND summary_metadata->>'status' IS DISTINCT FROM upper(summary_metadata->>'status')
    `,
    updateQuery: `
      UPDATE applications
      SET summary_metadata = jsonb_set(
        summary_metadata, '{status}',
        to_jsonb(upper(summary_metadata->>'status'))
      )
      WHERE summary_metadata IS NOT NULL
        AND summary_metadata->>'status' IS DISTINCT FROM upper(summary_metadata->>'status')
    `,
  },
  {
    label: "fit_analysis items -> type (lower -> UPPER)",
    selectQuery: `
      SELECT count(*)::text AS cnt FROM fit_analysis
      WHERE items IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(items) AS item
          WHERE item->>'type' IS DISTINCT FROM upper(item->>'type')
        )
    `,
    updateQuery: `
      UPDATE fit_analysis
      SET items = (
        SELECT jsonb_agg(
          jsonb_set(item, '{type}',
            to_jsonb(upper(item->>'type'))
          )
        )
        FROM jsonb_array_elements(items) AS item
        WHERE item->>'type' IS DISTINCT FROM upper(item->>'type')
      )
      WHERE items IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(items) AS item
          WHERE item->>'type' IS DISTINCT FROM upper(item->>'type')
        )
    `,
  },
  {
    label: "fit_analysis items -> weight (lower -> UPPER)",
    selectQuery: `
      SELECT count(*)::text AS cnt FROM fit_analysis
      WHERE items IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(items) AS item
          WHERE item->>'weight' IS DISTINCT FROM upper(item->>'weight')
        )
    `,
    updateQuery: `
      UPDATE fit_analysis
      SET items = (
        SELECT jsonb_agg(
          CASE WHEN item->>'weight' IS NOT NULL
            THEN jsonb_set(item, '{weight}', to_jsonb(upper(item->>'weight')))
            ELSE item
          END
        )
        FROM jsonb_array_elements(items) AS item
        WHERE item->>'weight' IS DISTINCT FROM upper(item->>'weight')
      )
      WHERE items IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(items) AS item
          WHERE item->>'weight' IS DISTINCT FROM upper(item->>'weight')
        )
    `,
  },
  {
    label: "user_preferences items -> weight (lower -> UPPER)",
    selectQuery: `
      SELECT count(*)::text AS cnt FROM user_preferences
      WHERE items IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(items) AS item
          WHERE item->>'weight' IS DISTINCT FROM upper(item->>'weight')
        )
    `,
    updateQuery: `
      UPDATE user_preferences
      SET items = (
        SELECT jsonb_agg(
          CASE WHEN item->>'weight' IS NOT NULL
            THEN jsonb_set(item, '{weight}', to_jsonb(upper(item->>'weight')))
            ELSE item
          END
        )
        FROM jsonb_array_elements(items) AS item
        WHERE item->>'weight' IS DISTINCT FROM upper(item->>'weight')
      )
      WHERE items IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(items) AS item
          WHERE item->>'weight' IS DISTINCT FROM upper(item->>'weight')
        )
    `,
  },
];

async function scanEnumColumns(em: EntityManager): Promise<void> {
  const enumChecks: { label: string; table: string; col: string }[] = [
    {
      label: "application_stage_events.to_stage",
      table: "application_stage_events",
      col: "to_stage",
    },
    {
      label: "application_stage_events.from_stage",
      table: "application_stage_events",
      col: "from_stage",
    },
    { label: "applications.source", table: "applications", col: "source" },
    {
      label: "applications.salary_period",
      table: "applications",
      col: "salary_period",
    },
    { label: "fit_analysis.status", table: "fit_analysis", col: "status" },
    {
      label: "draft_applications.conversion_status",
      table: "draft_applications",
      col: "conversion_status",
    },
    { label: "source_runs.status", table: "source_runs", col: "status" },
  ];

  let totalLower = 0;
  for (const ec of enumChecks) {
    const [err, rows] = await tryRun<{ cnt: string }[]>(
      em.query(
        `SELECT count(*)::text AS cnt FROM "${ec.table}" WHERE "${ec.col}"::text != upper("${ec.col}"::text)`,
      ),
    );
    if (err) {
      process.stdout.write(`  ⚠  ${ec.label}: ${err.message}\n`);
      continue;
    }
    const cnt = Number(rows[0]?.cnt ?? 0);
    if (cnt > 0) {
      process.stdout.write(
        `  !  ${ec.label}: ${cnt} row(s) with lowercase (bypassed enum constraint)\n`,
      );
      totalLower += cnt;
    }
  }
  if (totalLower === 0) {
    process.stdout.write(
      "  ✓ All PG enum columns are uppercase (as expected)\n",
    );
  }
}

async function fixJsonbFields(
  em: EntityManager,
  dryRun: boolean,
): Promise<{ ok: number; fail: number }> {
  let ok = 0;
  let fail = 0;

  for (const fix of JSONB_FIXES) {
    const prefix = dryRun ? "[DRY-RUN] " : "";
    process.stdout.write(`  ${prefix}${fix.label}... `);

    const [err, rows] = await tryRun<{ cnt: string }[]>(
      em.query(fix.selectQuery),
    );
    if (err) {
      process.stdout.write(`❌ ${err.message.slice(0, 80)}\n`);
      fail++;
      continue;
    }

    const fixed = Number(rows[0]?.cnt ?? 0);
    if (fixed === 0) {
      process.stdout.write(`✓ none to fix\n`);
    } else if (dryRun) {
      process.stdout.write(`✓ ${fixed} would be fixed\n`);
    } else {
      const [execErr] = await tryRun(em.query(fix.updateQuery));
      if (execErr) {
        process.stdout.write(`❌ ${execErr.message.slice(0, 80)}\n`);
        fail++;
      } else {
        process.stdout.write(`✓ ${fixed} fixed\n`);
        ok++;
      }
    }
  }

  return { ok, fail };
}

async function main() {
  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(NormalizeModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const dryRun = process.argv.includes("--dry-run");

  process.stdout.write("\nScanning PG enum columns...\n");
  await scanEnumColumns(em);

  process.stdout.write("\nFixing JSONB enum-like fields...\n");
  const { ok, fail } = await fixJsonbFields(em, dryRun);

  process.stdout.write(`\nDone. ${ok} fixes applied, ${fail} failed.\n`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
