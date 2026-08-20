import { cn, Heading, Stack, Text, Tooltip } from "@job-tracker/ui";
import { InfoIcon } from "@phosphor-icons/react";

import { UsageMetrics } from "@/modules/profile/ai-usage/components/UsageMetrics";
import { hasUsage, type AiUsageTotals } from "@/modules/profile/ai-usage/hooks/useAiUsageViewModel";

type TrialUsageAreaProps = { totals: AiUsageTotals; callsUsed: number; callsLimit: number; callsRemaining: number };

const numberFormatter = new Intl.NumberFormat();

export function TrialUsageArea({ totals, callsUsed, callsLimit, callsRemaining }: TrialUsageAreaProps) {
  return (
    <section aria-labelledby="trial-usage-heading" className={cn("border-t border-border-subtle pt-6")}>
      <Stack gap="md">
        <Stack direction="row" gap="xs" align="center">
          <Heading id="trial-usage-heading" as="h2" size="lg">
            AI Trial Usage
          </Heading>
          <UsageInfoTooltip content="Job Tracker trial usage during the last 30 days, shown separately from your personal key." />
        </Stack>

        <UsageMetrics totals={totals} />
        {!hasUsage(totals) ? (
          <Text size="sm" color="secondary">
            No AI Trial token usage has been recorded in the last 30 days.
          </Text>
        ) : null}

        <div className={cn("border-t border-border-subtle pt-4")}>
          <Heading as="h3" size="base">
            Trial allowance
          </Heading>
          <dl className={cn("mt-3 grid gap-3 sm:grid-cols-3")}>
            <TrialAllowanceMetric label="Calls used" value={callsUsed} />
            <TrialAllowanceMetric label="Call limit" value={callsLimit} />
            <TrialAllowanceMetric label="Calls remaining" value={callsRemaining} />
          </dl>
          {callsRemaining === 0 ? (
            <Text size="sm" color="warning" className={cn("mt-3")}>
              Your AI Trial calls are exhausted.
            </Text>
          ) : null}
        </div>
      </Stack>
    </section>
  );
}

type UsageInfoTooltipProps = { content: string };

function UsageInfoTooltip({ content }: UsageInfoTooltipProps) {
  return (
    <Tooltip content={content} side="right">
      <span
        className={cn("inline-flex cursor-help text-text-muted hover:text-text-secondary")}
        aria-label="Usage information"
      >
        <InfoIcon size={16} weight="regular" />
      </span>
    </Tooltip>
  );
}

type TrialAllowanceMetricProps = { label: string; value: number };

function TrialAllowanceMetric({ label, value }: TrialAllowanceMetricProps) {
  return (
    <div>
      <dt>
        <Text size="sm" color="secondary">
          {label}
        </Text>
      </dt>
      <dd className={cn("m-0 mt-1")}>
        <Text weight="semibold" className={cn("tabular-nums")}>
          {numberFormatter.format(value)}
        </Text>
      </dd>
    </div>
  );
}
