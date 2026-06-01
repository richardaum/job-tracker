"use client";

import { cn, Tooltip } from "@job-tracker/ui";
import type { ReactNode } from "react";

import type { JobSalary } from "@/gql/graphql";
import { majorFromCents, salaryPeriodToRateBasis } from "@/modules/jobs/shared/utils/salaryFormat";
import {
  formatConvertedSalaryRangeLine,
  SALARY_RATE_PERIOD_BASES,
  SALARY_RATE_PERIOD_LABELS,
} from "@/modules/tools/salary-calculator/lib/conversion";

type SalaryPeriodTooltipProps = { salary: JobSalary | null | undefined; children: ReactNode };

export function SalaryPeriodTooltip({ salary, children }: SalaryPeriodTooltipProps) {
  if (!salary) return children;

  const curr = salary.currency?.trim();
  const from = salaryPeriodToRateBasis(salary.period);
  const minMajor = majorFromCents(salary.minCents);
  const maxMajor = majorFromCents(salary.maxCents);

  if (!curr || !from || (minMajor == null && maxMajor == null) || children == null) {
    return children;
  }

  const rows = SALARY_RATE_PERIOD_BASES.flatMap((target) => {
    const text = formatConvertedSalaryRangeLine(minMajor, maxMajor, from, target, curr);
    if (!text) return [];
    return [{ target, text, label: SALARY_RATE_PERIOD_LABELS[target], active: from === target }];
  });

  return (
    <Tooltip
      content={
        <div className={cn("flex min-w-40 flex-col gap-0.5 text-left")}>
          {rows.map(({ target, text, label, active }) => (
            <div
              key={target}
              className={cn(
                "rounded px-1 py-0.5 tabular-nums",
                active ? "bg-white/8 font-medium text-white ring-1 ring-inset ring-white/15" : "text-white/80",
              )}
            >
              <span className={cn("mr-2 text-white/55", active && "text-white/80")}>{label}</span>
              {text}
            </div>
          ))}
        </div>
      }
      side="bottom"
      align="start"
    >
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 cursor-help underline decoration-dashed decoration-text-muted/30 underline-offset-2",
        )}
      >
        {children}
      </span>
    </Tooltip>
  );
}
