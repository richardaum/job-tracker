import { type SalaryPeriod } from "@/gql/hooks";
import { cn } from "@job-tracker/ui";
import { formatSalaryPeriodChip } from "./compensationFormat";

function TextChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted",
      )}
    >
      {children}
    </span>
  );
}

/**
 * When `omitPeriodCurrency` is set (e.g. range already shown on the same line), only tag chips are rendered.
 */
export function CompensationChipsRow({
  currency,
  period,
  tags,
  maxTagChips = 3,
  omitPeriodCurrency = false,
  className,
}: {
  currency: string | null | undefined;
  period: SalaryPeriod | null | undefined;
  tags: string[];
  maxTagChips?: number;
  omitPeriodCurrency?: boolean;
  className?: string;
}) {
  const showCur = !omitPeriodCurrency && Boolean(currency);
  const pChip = !omitPeriodCurrency
    ? formatSalaryPeriodChip(period ?? null)
    : null;
  const showTags = tags.slice(0, maxTagChips);
  const rest = Math.max(0, tags.length - showTags.length);
  if (!showCur && !pChip && showTags.length === 0) return null;
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
      {showTags.map((t) => (
        <span
          key={t}
          className={cn(
            "inline-flex max-w-[10rem] truncate rounded border border-border-subtle bg-bg-surface-hover px-1.5 py-0.5 text-xs text-text-secondary",
          )}
          title={t}
        >
          {t}
        </span>
      ))}
      {rest > 0 ? <TextChip>+{rest}</TextChip> : null}
    </span>
  );
}
