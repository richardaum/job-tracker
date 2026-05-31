"use client";

import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuItem,
} from "@job-tracker/ui";
import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react";

import { Weight } from "@/gql/hooks";
import { weightLabel } from "@/modules/work-preferences/model/work-preference.model";

interface PreferenceWeightDropdownProps {
  value: Weight;
  onChange: (weight: Weight) => void;
  variant?: "icon" | "labeled" | "badge";
  fullWidth?: boolean;
  className?: string;
}

type PreferenceWeightBadgeProps = {
  value: Weight;
  interactive?: boolean;
  className?: string;
};

function PreferenceWeightBadge({
  value,
  interactive = false,
  className,
}: PreferenceWeightBadgeProps) {
  const isHigh = value === Weight.High;
  return (
    <Badge
      intent={isHigh ? "success" : "default"}
      interactive={interactive}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {isHigh ? (
        <ArrowUpIcon size={12} weight="bold" />
      ) : (
        <ArrowDownIcon size={12} weight="bold" />
      )}
      {weightLabel(value)}
    </Badge>
  );
}

export function PreferenceWeightDropdown({
  value,
  onChange,
  variant = "labeled",
  fullWidth = false,
  className,
}: PreferenceWeightDropdownProps) {
  const isHigh = value === Weight.High;

  const trigger =
    variant === "badge" ? (
      <button
        type="button"
        aria-label={`Weight: ${weightLabel(value)}`}
        className={cn(
          "inline-flex border-0 bg-transparent p-0 leading-none",
          className,
        )}
      >
        <PreferenceWeightBadge value={value} interactive />
      </button>
    ) : variant === "icon" ? (
      <Button
        intent="ghost"
        size="md"
        aria-label={`Weight: ${weightLabel(value)}`}
        className={cn(
          "h-9 shrink-0 px-2",
          isHigh ? "text-text-success" : "text-text-muted",
          className,
        )}
      >
        {isHigh ? (
          <ArrowUpIcon size={14} weight="bold" />
        ) : (
          <ArrowDownIcon size={14} weight="bold" />
        )}
      </Button>
    ) : (
      <Button
        intent="secondary"
        size="md"
        aria-label={`Weight: ${weightLabel(value)}`}
        className={cn(
          fullWidth ? "w-full justify-start" : "justify-start",
          isHigh ? "text-text-success" : "text-text-muted",
          className,
        )}
      >
        {isHigh ? (
          <ArrowUpIcon size={14} weight="bold" className={cn("mr-2")} />
        ) : (
          <ArrowDownIcon size={14} weight="bold" className={cn("mr-2")} />
        )}
        {weightLabel(value)}
      </Button>
    );

  return (
    <DropdownMenu trigger={trigger} align="start">
      <DropdownMenuItem
        icon={
          <ArrowUpIcon
            size={14}
            weight="bold"
            className={cn("text-text-success")}
          />
        }
        onSelect={() => onChange(Weight.High)}
      >
        High
      </DropdownMenuItem>
      <DropdownMenuItem
        icon={
          <ArrowDownIcon
            size={14}
            weight="bold"
            className={cn("text-text-muted")}
          />
        }
        onSelect={() => onChange(Weight.Low)}
      >
        Low
      </DropdownMenuItem>
    </DropdownMenu>
  );
}

export { PreferenceWeightBadge };
