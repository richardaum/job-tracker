import React from "react";
import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";

export interface DropdownMenuProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export function DropdownMenu({
  trigger,
  children,
  align = "end",
}: DropdownMenuProps) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-[var(--component-dropdown-min-width)] rounded-md border border-border-subtle bg-bg-surface p-inline-gap shadow-md"
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  disabled = false,
  destructive = false,
}: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      onSelect={onSelect}
      disabled={disabled}
      className={`flex cursor-pointer select-none items-center rounded-sm px-button-x py-button-y-sm text-sm outline-none transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 ${destructive ? "text-text-error hover:bg-bg-error-subtle focus:bg-bg-error-subtle" : "text-text-primary hover:bg-bg-surface-hover focus:bg-bg-surface-hover"}`}
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}

export function DropdownMenuSeparator() {
  return <RadixDropdownMenu.Separator className="my-1 h-px bg-border-subtle" />;
}
