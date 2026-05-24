import {
  IntegrateDraftIntoJobs1767800000000,
  migrations,
} from "@api/database/migrations";
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
    const latestCtor = migrations[migrations.length - 1]!;

    const latest = migrationTimestamp(
      latestCtor as unknown as { name: string },
    );

    let maxPrior = BigInt(0);
    for (const Ctor of migrations) {
      if (Ctor === latestCtor) {
        break;
      }
      const t = migrationTimestamp(Ctor as unknown as { name: string });
      if (t > maxPrior) {
        maxPrior = t;
      }
    }

    expect(latest > maxPrior).toBe(true);
  });
});
