import { Injectable, BadRequestException } from "@nestjs/common";
import { Application, NewApplication } from "./applications.schema";
import { SalaryPeriodEnum } from "./salary-period.enum";

export type CompensationInput = {
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriodEnum | null;
};

export type CompensationColumns = Pick<
  NewApplication,
  "salaryMinCents" | "salaryMaxCents" | "salaryCurrency" | "salaryPeriod"
>;

type CompensationShape = {
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriodEnum | null;
};

const CURRENCY_RE = /^[A-Z]{3}$/;

@Injectable()
export class CompensationService {
  getCreateCompensation(input: CompensationInput): CompensationColumns {
    const c: CompensationShape = {
      salaryMinCents: input.salaryMinCents ?? null,
      salaryMaxCents: input.salaryMaxCents ?? null,
      salaryCurrency: input.salaryCurrency?.trim()
        ? input.salaryCurrency.trim().toUpperCase()
        : null,
      salaryPeriod: input.salaryPeriod ?? null,
    };
    this.assertValidCompensationState(c);
    return this.rowAfterValidation(c);
  }

  getUpdateCompensation(
    current: Application,
    input: CompensationInput,
  ): CompensationColumns | null {
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

    const c: CompensationShape = {
      salaryMinCents: min,
      salaryMaxCents: max,
      salaryCurrency: currency,
      salaryPeriod: period,
    };
    this.assertValidCompensationState(c);
    return this.rowAfterValidation(c);
  }

  private assertValidCompensationState(c: CompensationShape): void {
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

  private rowAfterValidation(c: CompensationShape): CompensationColumns {
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
        CompensationColumns["salaryPeriod"]
      >,
    };
  }
}
