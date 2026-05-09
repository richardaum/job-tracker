import type { ImportRunStatus } from "@/gql/graphql";

export type { ImportRunStatus };

/** Import run row (API-backed). */
export interface ImportRun {
  id: string;
  importerId: string;
  importerName: string;
  importerSource: string;
  status: ImportRunStatus;
  startedAt: string;
  entryUrl: string;
}
