import {
  type ExecutorPlanDocument,
  remoteyeahExecutorPlan,
} from "@api/domains/imports/importer-plans";
import { Injectable } from "@nestjs/common";

const IMPORTER_DISPLAY_NAME: Readonly<Record<string, string>> = Object.freeze({
  remoteyeah: "RemoteYeah",
});

const PLAN_BY_IMPORTER_ID: Readonly<Record<string, ExecutorPlanDocument>> =
  Object.freeze({ remoteyeah: remoteyeahExecutorPlan });

/** Row shape aligned with GraphQL `BuiltInImporterType`; single source on the API. */
export type BuiltInImporterRow = Readonly<{ importerId: string; name: string }>;

@Injectable()
export class PlanRegistryService {
  normalizeImporterKey(rawImporterId: string): string {
    return rawImporterId.trim().toLowerCase();
  }

  plan(normalizedImporterId: string): ExecutorPlanDocument | undefined {
    return PLAN_BY_IMPORTER_ID[normalizedImporterId];
  }

  /** Built-ins that have an executor plan; labels for dashboard / extension parity. */
  listBuiltInImporters(): BuiltInImporterRow[] {
    const rows = Object.keys(PLAN_BY_IMPORTER_ID).map((importerId) => ({
      importerId,
      name:
        IMPORTER_DISPLAY_NAME[importerId] ??
        (() => {
          throw new Error(
            `Missing display name for built-in importer "${importerId}"`,
          );
        })(),
    }));
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }
}
