"use client";

import { Button, cn, conceptIcon, Heading, Skeleton, Stack, Text } from "@job-tracker/ui";

import { PersonalKeyUsageArea } from "@/modules/profile/ai-usage/components/PersonalKeyUsageArea";
import { TrialUsageArea } from "@/modules/profile/ai-usage/components/TrialUsageArea";
import { useAiUsageViewModel } from "@/modules/profile/ai-usage/hooks/useAiUsageViewModel";
import { AiProfileSubTabs } from "@/modules/profile/ai/components/AiProfileSubTabs";

const RefreshIcon = conceptIcon.refresh;

export default function AiUsageTabPage() {
  const {
    personalKey,
    trial,
    hasOpenAiKey,
    trialCallsUsed,
    trialCallsLimit,
    trialCallsRemaining,
    showInitialLoading,
    refreshing,
    unavailable,
    hasStaleData,
    refresh,
  } = useAiUsageViewModel();

  if (showInitialLoading) {
    return (
      <>
        <AiProfileSubTabs activeTab="usage" />
        <AiUsageLoadingState />
      </>
    );
  }

  if (unavailable) {
    return (
      <>
        <AiProfileSubTabs activeTab="usage" />
        <div className={cn("max-w-2xl border-t border-border-subtle pt-6")}>
          <Stack gap="md" align="start">
            <div role="alert">
              <Heading as="h2" size="lg">
                AI usage is temporarily unavailable
              </Heading>
              <Text size="sm" color="secondary" className={cn("mt-1")}>
                We could not load your usage. Try refreshing in a moment.
              </Text>
            </div>
            <RefreshButton refreshing={refreshing} onRefresh={() => void refresh()} />
          </Stack>
        </div>
      </>
    );
  }

  return (
    <Stack gap="lg" align="stretch" className={cn("w-full min-w-0")}>
      <AiProfileSubTabs activeTab="usage" />
      <Stack direction="row" gap="md" align="center" justify="between" className={cn("w-full flex-wrap")}>
        <div>
          <Heading as="h2" size="xl">
            AI Usage
          </Heading>
          <Text size="sm" color="secondary" className={cn("mt-1")}>
            Token and call activity recorded by Job Tracker over the last 30 days.
          </Text>
        </div>
        <RefreshButton refreshing={refreshing} onRefresh={() => void refresh()} />
      </Stack>

      {hasStaleData ? (
        <Text role="alert" size="sm" color="warning">
          Refresh failed. The usage shown below may be out of date.
        </Text>
      ) : null}

      <PersonalKeyUsageArea hasOpenAiKey={hasOpenAiKey} totals={personalKey} />
      <TrialUsageArea
        totals={trial}
        callsUsed={trialCallsUsed}
        callsLimit={trialCallsLimit}
        callsRemaining={trialCallsRemaining}
      />
    </Stack>
  );
}

type RefreshButtonProps = { refreshing: boolean; onRefresh: () => void };

function RefreshButton({ refreshing, onRefresh }: RefreshButtonProps) {
  return (
    <Button
      intent="secondary"
      size="md"
      state={refreshing ? "loading" : "default"}
      leftIcon={<RefreshIcon size={14} weight="regular" />}
      onClick={onRefresh}
    >
      Refresh
    </Button>
  );
}

function AiUsageLoadingState() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading AI usage" className={cn("grid gap-4")}>
      <span className={cn("sr-only")}>Loading AI usage…</span>
      {["personal", "trial"].map((area) => (
        <Stack key={area} gap="md" className={cn("border-t border-border-subtle pt-6")}>
          <Skeleton variant="text" className={cn("h-6 w-56 max-w-full")} />
          <Skeleton variant="text" className={cn("h-4 w-96 max-w-full")} />
          <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4")}>
            {[0, 1, 2, 3].map((metric) => (
              <Skeleton key={metric} className={cn("h-20")} />
            ))}
          </div>
        </Stack>
      ))}
    </div>
  );
}
