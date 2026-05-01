import { cn } from "@job-tracker/ui";

import { type SalaryPeriod } from "@/gql/hooks";

import { formatSalaryPeriodChip } from "./compensationFormat";

export function CompensationRow({
  currency,
  period,
  omitPeriodCurrency = false,
  className,
}: {
  currency: string | null | undefined;
  period: SalaryPeriod | null | undefined;
  omitPeriodCurrency?: boolean;
  className?: string;
}) {
  const showCur = !omitPeriodCurrency && Boolean(currency);
  const pChip = !omitPeriodCurrency
    ? formatSalaryPeriodChip(period ?? null)
    : null;
  if (!showCur && !pChip) return null;
  return (
    <span
      className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
    >
      {showCur && currency ? (
        <span
          className={cn(
            "inline-flex max-w-full rounded border border-border-subtle bg-bg-surface-hover px-1.5 py-0.5 text-xs text-text-secondary",
          )}
        >
          {currency}
        </span>
      ) : null}
      {pChip ? (
        <span
          className={cn(
            "inline-flex rounded border border-border-subtle bg-bg-surface-hover px-1.5 py-0.5 text-xs text-text-secondary",
          )}
        >
          {pChip}
        </span>
      ) : null}
    </span>
  );
}
