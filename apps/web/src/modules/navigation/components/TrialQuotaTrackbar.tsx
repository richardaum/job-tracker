"use client";

import { cn, InfoTooltip, Text } from "@job-tracker/ui";
import { SparkleIcon } from "@phosphor-icons/react";

interface TrialQuotaTrackbarProps {
  trialCallsUsed: number;
  trialCallsLimit: number;
}

export function TrialQuotaTrackbar({ trialCallsUsed, trialCallsLimit }: TrialQuotaTrackbarProps) {
  const percentageUsed = Math.min((trialCallsUsed / trialCallsLimit) * 100, 100);

  return (
    <div className={cn("mx-1 mb-3 rounded-md border border-border-default bg-bg-surface-subtle p-3")}>
      <div className={cn("flex items-center justify-between gap-2 mb-2")}>
        <div className={cn("flex items-center gap-1")}>
          <SparkleIcon size={14} weight="regular" className={cn("shrink-0 text-text-secondary")} aria-hidden />
          <Text size="xs" weight="semibold" className={cn("text-text-secondary uppercase tracking-wider")}>
            AI Trial
          </Text>
          <InfoTooltip
            size={12}
            maxWidth={200}
            content="You've been granted free trial credits to explore AI-powered features — no OpenAI key required. Add your own key anytime to keep going once they run out."
          />
        </div>
        <Text size="xs" color="muted" className={cn("text-text-muted")}>
          {trialCallsUsed}/{trialCallsLimit}
        </Text>
      </div>
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white")}>
        <div
          role="progressbar"
          aria-valuenow={trialCallsUsed}
          aria-valuemin={0}
          aria-valuemax={trialCallsLimit}
          className={cn(
            "h-full transition-all duration-300",
            percentageUsed >= 100
              ? "bg-border-error"
              : percentageUsed >= 80
                ? "bg-border-warning"
                : "bg-border-success",
          )}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>
    </div>
  );
}
