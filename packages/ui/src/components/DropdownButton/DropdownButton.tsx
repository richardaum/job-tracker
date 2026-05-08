import { CaretDownIcon } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ButtonIntent, ButtonSize } from "@ui/components/Button/Button";
import { cn } from "@ui/lib/cn";
import React from "react";

export interface DropdownButtonProps {
  children: React.ReactNode;
  content: React.ReactNode;
  onClick?: () => void;
  intent?: ButtonIntent;
  size?: ButtonSize;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  buttonClassName?: string;
}

const intentClasses: Record<ButtonIntent, string> = {
  primary:
    "border-r border-[#cac8f7] bg-bg-brand text-text-inverted hover:bg-bg-brand-hover",
  secondary:
    "border-l border-t border-b border-border-default bg-bg-surface text-text-primary hover:bg-bg-surface-hover",
  ghost:
    "border-transparent bg-transparent text-text-brand shadow-none hover:bg-bg-brand-subtle",
  outlined:
    "border-l border-t border-b border-border-default bg-transparent text-text-primary shadow-none hover:bg-bg-surface-hover",
  destructive:
    "border-l border-t border-b border-border-error bg-bg-error-subtle text-text-error hover:bg-bg-surface",
};

const dropdownIntentClasses: Record<ButtonIntent, string> = {
  primary:
    "bg-bg-brand text-text-inverted hover:bg-bg-brand-hover rounded-r-md",
  secondary:
    "border border-border-default bg-bg-surface text-text-primary hover:bg-bg-surface-hover rounded-r-md",
  ghost: "bg-transparent text-text-brand hover:bg-bg-brand-subtle rounded-r-md",
  outlined:
    "border border-border-default bg-transparent text-text-primary hover:bg-bg-surface-hover rounded-r-md",
  destructive:
    "border border-border-error bg-bg-error-subtle text-text-error hover:bg-bg-surface rounded-r-md",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-5 py-[9px] text-sm",
  sm: "px-5 py-[14px] text-base",
  md: "px-6 py-[14px] text-lg",
  lg: "px-6 py-[14px] text-lg",
};

export function DropdownButton({
  children,
  content,
  onClick,
  intent = "primary",
  size = "md",
  align = "end",
  open,
  onOpenChange,
  className,
  buttonClassName,
}: DropdownButtonProps) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <div
        className={cn(
          "inline-flex items-stretch rounded-md bg-bg-surface",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "inline-flex items-center cursor-pointer rounded-l-md font-medium whitespace-nowrap transition-colors hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
            intentClasses[intent],
            sizeClasses[size],
            (intent === "outlined" ||
              intent === "secondary" ||
              intent === "destructive") &&
              "rounded-r-none",
            buttonClassName,
          )}
        >
          {children}
        </button>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className={cn(
              "cursor-pointer rounded-r-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
              dropdownIntentClasses[intent],
              sizeClasses[size],
              "data-[state=open]:bg-bg-brand-hover px-2",
            )}
          >
            <CaretDownIcon size={14} weight="regular" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            sideOffset={6}
            className={cn(
              "z-50 min-w-44 rounded-md border border-border-subtle bg-bg-surface p-2 shadow-md",
            )}
          >
            {content}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </div>
    </DropdownMenu.Root>
  );
}
