import { migrations } from "@api/database/migrations";
import { IntegrateDraftIntoJobs1767800000000 } from "@api/database/migrations/1767800000000-integrate-draft-into-jobs";
import { AddUserActiveTokenVersion1767900000000 } from "@api/database/migrations/1767900000000-add-user-active-token-version";
import { describe, expect, it } from "vitest";

function migrationTimestamp(Ctor: { name: string }): bigint {
  const m = /^.*(\d{10,})$/.exec(Ctor.name);
  if (!m) {
    throw new Error(
      `Migration class name missing timestamp suffix: ${Ctor.name}`,
    );
  }
  return BigInt(m[1]!);
}

describe("IntegrateDraftIntoJobs1767800000000", () => {
  it("exports a MigrationInterface-compatible class instance", () => {
    const mig = new IntegrateDraftIntoJobs1767800000000();
    expect(mig.name).toBe("IntegrateDraftIntoJobs1767800000000");
    expect(mig.transaction).toBe(false);
    expect(typeof mig.up).toBe("function");
    expect(typeof mig.down).toBe("function");
  });

  it("is ordered last among registered migrations so the timestamp stays monotonic", () => {
    expect(migrations[migrations.length - 1]).toBe(
      AddUserActiveTokenVersion1767900000000,
    );

    const latest = migrationTimestamp(AddUserActiveTokenVersion1767900000000);

    let maxPrior = BigInt(0);
    for (const Ctor of migrations) {
      if (Ctor === AddUserActiveTokenVersion1767900000000) {
        break;
      }
      const t = migrationTimestamp(Ctor);
      if (t > maxPrior) {
        maxPrior = t;
      }
    }

    expect(latest > maxPrior).toBe(true);
  });
});
