import {
  type ExecutorPlanDocument,
  remoteyeahExecutorPlan,
} from "@api/domains/sources/source-profiles";
import { Injectable } from "@nestjs/common";

const SOURCE_PROFILE_DISPLAY_NAME: Readonly<Record<string, string>> = Object.freeze({
  remoteyeah: "RemoteYeah",
});

const PLAN_BY_SOURCE_PROFILE_ID: Readonly<Record<string, ExecutorPlanDocument>> =
  Object.freeze({ remoteyeah: remoteyeahExecutorPlan });

/** Row shape aligned with GraphQL `SourceProfileType`; single source on the API. */
export type SourceProfileDescriptorRow = Readonly<{
  sourceProfileId: string;
  name: string;
}>;

@Injectable()
export class SourceProfileRegistryService {
  normalizeSourceProfileKey(rawSourceProfileId: string): string {
    return rawSourceProfileId.trim().toLowerCase();
  }

  plan(normalizedSourceProfileId: string): ExecutorPlanDocument | undefined {
    return PLAN_BY_SOURCE_PROFILE_ID[normalizedSourceProfileId];
  }

  /** Source profiles that have an executor plan; labels for dashboard / extension parity. */
  listSourceProfileDescriptors(): SourceProfileDescriptorRow[] {
    const rows = Object.keys(PLAN_BY_SOURCE_PROFILE_ID).map((sourceProfileId) => ({
      sourceProfileId,
      name:
        SOURCE_PROFILE_DISPLAY_NAME[sourceProfileId] ??
        (() => {
          throw new Error(
            `Missing display name for registry source profile "${sourceProfileId}"`,
          );
        })(),
    }));
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }
}
