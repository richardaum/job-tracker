import { cn, Text } from "@job-tracker/ui";

import type { AiUsageTotals } from "@/modules/profile/ai-usage/hooks/useAiUsageViewModel";

type UsageMetricsProps = { totals: AiUsageTotals };

const numberFormatter = new Intl.NumberFormat();

export function UsageMetrics({ totals }: UsageMetricsProps) {
  const metrics = [
    { label: "Total tokens", value: totals.totalTokens },
    { label: "Input tokens", value: totals.inputTokens },
    { label: "Output tokens", value: totals.outputTokens },
    { label: "Calls", value: totals.calls },
  ];

  return (
    <dl className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4")}>
      {metrics.map((metric) => (
        <div key={metric.label} className={cn("min-w-0 rounded-lg border border-border-subtle bg-bg-field px-4 py-3")}>
          <dt>
            <Text size="sm" color="secondary">
              {metric.label}
            </Text>
          </dt>
          <dd className={cn("m-0 mt-1")}>
            <Text size="lg" weight="semibold" className={cn("tabular-nums")}>
              {numberFormatter.format(metric.value)}
            </Text>
          </dd>
        </div>
      ))}
    </dl>
  );
}
