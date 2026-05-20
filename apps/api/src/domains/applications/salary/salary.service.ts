import { BadRequestException, Injectable } from "@nestjs/common";

import type { SalaryColumns, SalaryInput } from "./salary.schema";
import { SalaryPeriodEnum } from "./salary-period.enum";

type SalaryShape = {
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriodEnum | null;
};

const CURRENCY_RE = /^[A-Z]{3}$/;

@Injectable()
export class SalaryService {
  getCreateSalary(input: SalaryInput): SalaryColumns {
    const c: SalaryShape = {
      salaryMinCents: input.salaryMinCents ?? null,
      salaryMaxCents: input.salaryMaxCents ?? null,
      salaryCurrency: input.salaryCurrency?.trim()
        ? input.salaryCurrency.trim().toUpperCase()
        : null,
      salaryPeriod: input.salaryPeriod ?? null,
    };
    this.assertValidSalaryState(c);
    return this.rowAfterValidation(c);
  }

  getUpdateSalary(
    current: SalaryShape,
    input: SalaryInput,
  ): SalaryColumns | null {
    const anyKey =
      input.salaryMinCents !== undefined ||
      input.salaryMaxCents !== undefined ||
      input.salaryCurrency !== undefined ||
      input.salaryPeriod !== undefined;
    if (!anyKey) return null;

    const min =
      input.salaryMinCents === undefined
        ? current.salaryMinCents
        : input.salaryMinCents;
    const max =
      input.salaryMaxCents === undefined
        ? current.salaryMaxCents
        : input.salaryMaxCents;
    const currency =
      input.salaryCurrency === undefined
        ? current.salaryCurrency
        : input.salaryCurrency == null || input.salaryCurrency === ""
          ? null
          : input.salaryCurrency.trim().toUpperCase();
    const period =
      input.salaryPeriod === undefined
        ? (current.salaryPeriod as SalaryPeriodEnum | null)
        : input.salaryPeriod;

    const c: SalaryShape = {
      salaryMinCents: min,
      salaryMaxCents: max,
      salaryCurrency: currency,
      salaryPeriod: period,
    };
    this.assertValidSalaryState(c);
    return this.rowAfterValidation(c);
  }

  private assertValidSalaryState(c: SalaryShape): void {
    const hasMin = c.salaryMinCents != null;
    const hasMax = c.salaryMaxCents != null;
    const hasAmount = hasMin || hasMax;

    if (!hasAmount) return;

    if (c.salaryCurrency == null || c.salaryPeriod == null) {
      throw new BadRequestException(
        "A salary range requires salaryCurrency and salaryPeriod",
      );
    }
    if (!CURRENCY_RE.test(c.salaryCurrency)) {
      throw new BadRequestException(
        "salaryCurrency must be a 3-letter ISO 4217 code (e.g. BRL, USD)",
      );
    }
    if (c.salaryMinCents != null && c.salaryMinCents < 0) {
      throw new BadRequestException("salaryMinCents must be non-negative");
    }
    if (c.salaryMaxCents != null && c.salaryMaxCents < 0) {
      throw new BadRequestException("salaryMaxCents must be non-negative");
    }
    if (
      c.salaryMinCents != null &&
      c.salaryMaxCents != null &&
      c.salaryMinCents > c.salaryMaxCents
    ) {
      throw new BadRequestException(
        "salaryMinCents must be less than or equal to salaryMaxCents",
      );
    }
  }

  private rowAfterValidation(c: SalaryShape): SalaryColumns {
    const hasAmount = c.salaryMinCents != null || c.salaryMaxCents != null;
    if (!hasAmount) {
      return {
        salaryMinCents: null,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
      };
    }
    return {
      salaryMinCents: c.salaryMinCents,
      salaryMaxCents: c.salaryMaxCents,
      salaryCurrency: c.salaryCurrency,
      salaryPeriod: c.salaryPeriod as NonNullable<
        SalaryColumns["salaryPeriod"]
      >,
    };
  }
}
