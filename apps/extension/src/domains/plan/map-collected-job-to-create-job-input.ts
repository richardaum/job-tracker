import { isParsedSalaryForCreateJobInput } from "@/domains/dom/parse-salary-inner-text-for-job";
import type { Job } from "@/domains/dom/types";
import { type CreateJobInput, JobSource } from "@/gql/graphql";

const MAX_DESCRIPTION_CHARS = 100_000;

function str(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return undefined;
}

/**
 * CreateJobInput coverage from scraped `Job` (see `remoteyeah.plan.json` keys):
 *
 * | Input field        | Job source              | Notes |
 * | ------------------ | ----------------------- | ----- |
 * | title, company     | title, company          | Required; fallbacks if missing. |
 * | description        | description             | Detail HTML; truncated. |
 * | urls               | detailUrl               | Single listing URL. |
 * | tags               | locationRequirements    | Split on newline / comma / middot / pipe / semicolon. |
 * | salary*            | salary                  | `format: "salary"` → parsed payload for input. |
 * | source             | detailUrl               | Inferred via URL substrings (same as API: Linkedin, Jack, Wellfound, RemoteYeah). |
 * | companyId          | —                       | Not on job; needs company lookup / resolver. |
 *
 * Also on job but unused here: `publishedAt` (could become metadata if API gains a field).
 */
/** Delimiters between location badges (RemoteYeah uses newlines in `innerText`). */
const LOCATION_TAG_SPLIT = /[\r\n,\u00B7|;]+/u;

function tagsFromLocationRequirements(raw: unknown): string[] | undefined {
  const s = str(raw);
  if (s == null) return undefined;
  const parts = s
    .split(LOCATION_TAG_SPLIT)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  return parts.length > 0 ? parts : undefined;
}

function inferJobSourceFromUrls(urls: string[]): JobSource | undefined {
  for (const url of urls) {
    const trimmed = url.trim();
    if (trimmed.length === 0) continue;
    const lower = trimmed.toLowerCase();
    if (lower.includes("linkedin")) return JobSource.Linkedin;
    if (lower.includes("jack")) return JobSource.Jack;
    if (lower.includes("wellfound")) return JobSource.Wellfound;
    if (lower.includes("remoteyeah")) return JobSource.RemoteYeah;
  }
  return undefined;
}

export function mapCollectedJobToCreateJobInput(job: Job): CreateJobInput {
  const title = str(job.title) ?? "Untitled";
  const company = str(job.company) ?? "Unknown";

  let description = str(job.description);
  if (description != null && description.length > MAX_DESCRIPTION_CHARS) {
    description = description.slice(0, MAX_DESCRIPTION_CHARS);
  }

  const detailUrl = str(job.detailUrl);
  const tags = tagsFromLocationRequirements(job.locationRequirements);
  const salary = isParsedSalaryForCreateJobInput(job.salary)
    ? job.salary
    : undefined;
  const source =
    detailUrl != null ? inferJobSourceFromUrls([detailUrl]) : undefined;

  return {
    title,
    company,
    ...(description != null ? { description } : {}),
    ...(detailUrl != null ? { urls: [detailUrl] } : {}),
    ...(source != null ? { source } : {}),
    ...(tags != null ? { tags } : {}),
    ...(salary != null
      ? {
          salary: {
            minCents: salary.salaryMinCents,
            maxCents: salary.salaryMaxCents,
            currency: salary.salaryCurrency,
            period: salary.salaryPeriod,
          },
        }
      : {}),
  };
}
