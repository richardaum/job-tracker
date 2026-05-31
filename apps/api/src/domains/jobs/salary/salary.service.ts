import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import type { Job } from "@api/domains/jobs/jobs.schema";
import { Injectable } from "@nestjs/common";

import type { JobSalaryInput } from "./job-salary.input";

@Injectable()
export class SalaryService {
  getCreateSalary(input: Partial<JobSalaryInput> = {}): SalaryEmbedded {
    const embedded = new SalaryEmbedded();
    embedded.minCents = input.minCents ?? null;
    embedded.maxCents = input.maxCents ?? null;
    embedded.currency = input.currency ?? null;
    embedded.period = input.period ?? null;
    embedded.normalize();
    embedded.validate();
    return embedded;
  }

  getUpdateSalary(
    current: Job,
    input: Partial<JobSalaryInput>,
  ): SalaryEmbedded | null {
    const anyKey =
      input.minCents !== undefined ||
      input.maxCents !== undefined ||
      input.currency !== undefined ||
      input.period !== undefined;
    if (!anyKey) return null;

    const embedded = new SalaryEmbedded();
    embedded.minCents =
      input.minCents === undefined
        ? (current.salary?.minCents ?? null)
        : input.minCents;
    embedded.maxCents =
      input.maxCents === undefined
        ? (current.salary?.maxCents ?? null)
        : input.maxCents;
    embedded.currency =
      input.currency === undefined
        ? (current.salary?.currency ?? null)
        : input.currency == null || input.currency === ""
          ? null
          : input.currency;

    embedded.period =
      input.period === undefined
        ? (current.salary?.period ?? null)
        : input.period;

    const hasAmount = embedded.minCents != null || embedded.maxCents != null;
    if (!hasAmount) {
      embedded.currency = null;
      embedded.period = null;
    }

    embedded.normalize();
    embedded.validate();
    return embedded;
  }
}
