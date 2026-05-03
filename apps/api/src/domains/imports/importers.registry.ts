/**
 * Built-in importers — **single source**: display name + executor plan **`{ steps }`**.
 * `entryUrl` (for `ImportRun`) derives from the first literal **`tab.open`** URL (no templates).
 */

export type ExecutorPlanDocument = Readonly<{
  steps: readonly Readonly<Record<string, unknown>>[];
}>;

type BuiltInImporterRecord = Readonly<{
  name: string;
  executorPlan: ExecutorPlanDocument;
}>;

function listingEntryUrlFromSteps(
  steps: readonly Readonly<Record<string, unknown>>[],
): string | null {
  for (const step of steps) {
    const action = step.action;
    const url = step.url;
    if (
      action === "tab.open" &&
      typeof url === "string" &&
      url.trim() !== "" &&
      !/{{/.test(url)
    ) {
      return url;
    }
  }
  return null;
}

const REMOTEYEAH_BOARD =
  "https://remoteyeah.com/remote-frontend-engineer+reactjs-jobs-in-brazil+latin-america+worldwide#jobs";

const remoteyeahPlan = Object.freeze<ExecutorPlanDocument>({
  steps: [
    { id: "listing-tab", action: "tab.open", url: REMOTEYEAH_BOARD },
    {
      id: "iterate-rows",
      action: "iterate.rows",
      iterate: ".job-card",
      fields: [
        { key: "jobId", on: "self", capture: { attribute: "data-job-id" } },
        {
          key: "title",
          css: ".job-card-title-text",
          capture: { property: "textContent" },
        },
        {
          key: "company",
          css: ".job-card-company",
          capture: { property: "textContent" },
        },
        {
          key: "detailHref",
          css: ".job-card-title a, a.job-card-title",
          capture: { property: "href" },
        },
      ],
    },
    {
      action: "forEach.item",
      from: { step: "iterate-rows" },
      steps: [
        { id: "detail-tab", action: "tab.open", url: "{{row.detailHref}}" },
        {
          action: "dom.capture",
          selector: ".description, [data-testid='job-description']",
          capture: { property: "innerHTML", format: "$tiptap" },
        },
        { action: "tab.close", ref: "detail-tab" },
      ],
    },
    { action: "tab.close", ref: "listing-tab" },
  ],
});

/** Importer configs keyed by id (lowercase keys only). **/
const IMPORTER_REGISTRY: Readonly<Record<string, BuiltInImporterRecord>> =
  Object.freeze({
    remoteyeah: Object.freeze({
      name: "RemoteYeah",
      executorPlan: remoteyeahPlan,
    }),
  });

/** Resolved importer for API / persistence (`ImportRun`). */
export type ResolvedImporter = Readonly<{
  name: string;
  entryUrl: string;
  executorPlan: ExecutorPlanDocument;
}>;

/**
 * Canonical built-in importer, or **`null`** if id is unknown.
 * **`entryUrl`** is derived from **`executorPlan`** (first **`tab.open`** with a literal URL).
 */
export function resolveImporter(importerId: string): ResolvedImporter | null {
  const key = importerId.trim().toLowerCase();
  const row = IMPORTER_REGISTRY[key];
  if (row == null) {
    return null;
  }
  const entryUrl = listingEntryUrlFromSteps(row.executorPlan.steps);
  if (entryUrl == null) {
    throw new Error(
      `Importer "${key}" is misconfigured: no literal listing tab.open URL in plan.`,
    );
  }
  return { name: row.name, entryUrl, executorPlan: row.executorPlan };
}
