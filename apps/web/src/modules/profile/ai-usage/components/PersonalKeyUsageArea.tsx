import { Button, cn, Heading, Stack, Text, Tooltip } from "@job-tracker/ui";
import { InfoIcon } from "@phosphor-icons/react";
import NextLink from "next/link";

import { UsageMetrics } from "@/modules/profile/ai-usage/components/UsageMetrics";
import { hasUsage, type AiUsageTotals } from "@/modules/profile/ai-usage/hooks/useAiUsageViewModel";

type PersonalKeyUsageAreaProps = { hasOpenAiKey: boolean; totals: AiUsageTotals };

export function PersonalKeyUsageArea({ hasOpenAiKey, totals }: PersonalKeyUsageAreaProps) {
  return (
    <section aria-labelledby="personal-key-usage-heading" className={cn("border-t border-border-subtle pt-6")}>
      <Stack gap="md">
        <Stack direction="row" gap="xs" align="center">
          <Heading id="personal-key-usage-heading" as="h2" size="lg">
            Personal OpenAI Key Usage
          </Heading>
          <UsageInfoTooltip content="Job Tracker usage from your personal key during the last 30 days." />
        </Stack>

        {!hasOpenAiKey ? (
          <div className={cn("rounded-md border border-border-subtle bg-bg-field p-4")}>
            <Stack gap="sm" align="start">
              <Text weight="medium">No personal OpenAI key saved</Text>
              <Text size="sm" color="secondary">
                Add a key in Settings to start tracking personal-key usage. Earlier usage cannot be reconstructed.
              </Text>
              <Button asChild intent="secondary" size="sm">
                <NextLink href="/profile/ai/settings">Add OpenAI key</NextLink>
              </Button>
            </Stack>
          </div>
        ) : (
          <>
            <UsageMetrics totals={totals} />
            {!hasUsage(totals) ? (
              <Text size="sm" color="secondary">
                No personal-key usage has been recorded in the last 30 days.
              </Text>
            ) : null}
          </>
        )}
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
