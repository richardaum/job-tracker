"use client";

import { cn, Spinner, Text } from "@job-tracker/ui";
import { type ReactNode, useEffect, useState } from "react";

import { clientEnv } from "@/env/client";

const SAVING_SPINNER_DELAY_MS = 300;

function useDelayedTrue(value: boolean, delayMs: number): boolean {
  const [showDelayed, setShowDelayed] = useState(false);

  useEffect(() => {
    if (!value) {
      return;
    }

    const timer = window.setTimeout(() => setShowDelayed(true), delayMs);
    return () => {
      window.clearTimeout(timer);
      setShowDelayed(false);
    };
  }, [value, delayMs]);

  return value && showDelayed;
}

type SettingCardLabelProps = {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SettingCardLabel({ icon, children, className }: SettingCardLabelProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {icon}
      <Text size="base" weight="medium">
        {children}
      </Text>
    </div>
  );
}

type SettingCardProps = {
  label: ReactNode;
  description: string;
  control: ReactNode;
  pending?: boolean;
};

function warnIfSettingCardLabelViolates(label: ReactNode): void {
  if (clientEnv.NODE_ENV !== "development") return;

  const labelSegments = Array.isArray(label) ? label : [label];
  const invalidLabel = labelSegments.some(
    (child) =>
      child != null &&
      (typeof child !== "object" || !("type" in child) || child.type !== SettingCardLabel),
  );
  if (invalidLabel) {
    console.warn(
      "[SettingCard] Pass `label` using only `<SettingCard.Label>...</SettingCard.Label>`.",
    );
  }
}

export function SettingCard({ label, description, control, pending = false }: SettingCardProps) {
  warnIfSettingCardLabelViolates(label);

  const showSpinner = useDelayedTrue(pending, SAVING_SPINNER_DELAY_MS);

  return (
    <div className={cn("flex items-center gap-4 rounded-lg border border-border-subtle p-4")}>
      <div className={cn("flex flex-col gap-0.5")}>
        <div className={cn("flex items-center gap-2")}>
          {label}
          {showSpinner ? <Spinner size="sm" label="Saving setting" /> : null}
        </div>
        <Text size="sm" color="muted">
          {description}
        </Text>
      </div>
      <div className={cn("shrink-0")}>{control}</div>
    </div>
  );
}
