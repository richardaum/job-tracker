import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
import { BadRequestException } from "@nestjs/common";
import { IsInt, IsOptional, Matches, Min } from "class-validator";
import { Column } from "typeorm";

const CURRENCY_RE = /^[A-Z]{3}$/;

export class SalaryEmbedded {
  @Column({ type: "integer", nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  minCents: number | null = null;

  @Column({ type: "integer", nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxCents: number | null = null;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  @Matches(CURRENCY_RE)
  currency: string | null = null;

  @Column({
    type: "enum",
    enum: SalaryPeriodEnum,
    enumName: "salary_period",
    nullable: true,
  })
  @IsOptional()
  period: SalaryPeriodEnum | null = null;

  validate(): void {
    const hasMin = this.minCents != null;
    const hasMax = this.maxCents != null;
    const hasAmount = hasMin || hasMax;

    if (!hasAmount) return;

    if (this.currency == null || this.period == null) {
      throw new BadRequestException(
        "A salary range requires currency and period",
      );
    }
    if (!CURRENCY_RE.test(this.currency)) {
      throw new BadRequestException(
        "currency must be a 3-letter ISO 4217 code (e.g. BRL, USD)",
      );
    }
    if (this.minCents != null && this.minCents < 0) {
      throw new BadRequestException("minCents must be non-negative");
    }
    if (this.maxCents != null && this.maxCents < 0) {
      throw new BadRequestException("maxCents must be non-negative");
    }
    if (
      this.minCents != null &&
      this.maxCents != null &&
      this.minCents > this.maxCents
    ) {
      throw new BadRequestException(
        "minCents must be less than or equal to maxCents",
      );
    }
  }

  normalize(): void {
    if (this.currency != null) {
      this.currency = this.currency.trim().toUpperCase();
    }
  }
}
