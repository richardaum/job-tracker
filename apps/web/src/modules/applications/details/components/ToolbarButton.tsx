"use client";

import { cn, Tooltip } from "@job-tracker/ui";
import { CircleNotchIcon } from "@phosphor-icons/react";
import React from "react";

export interface ToolbarButtonProps {
  label: React.ReactNode;
  ariaLabel?: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function ToolbarButton({
  label,
  ariaLabel,
  active,
  onClick,
  disabled,
  loading = false,
  className,
}: ToolbarButtonProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded px-2 py-1 text-xs transition-colors border",
        active
          ? "border-border-brand bg-bg-brand-subtle text-text-brand"
          : "border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-surface-hover",
        className,
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {loading ? (
        <CircleNotchIcon
          size={14}
          weight="bold"
          className={cn("animate-spin")}
        />
      ) : (
        label
      )}
    </button>
  );

  if (!ariaLabel) {
    return button;
  }

  return <Tooltip content={ariaLabel}>{button}</Tooltip>;
}
