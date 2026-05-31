import type { ReactElement, ReactNode } from "react";
import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@ui/lib/cn";

export interface DropdownMenuProps {
  trigger: ReactElement;
  children: ReactNode;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DropdownMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
}

export interface DropdownMenuLabelProps {
  children: ReactNode;
  className?: string;
}

export interface DropdownMenuGroupProps {
  children: ReactNode;
}

export function DropdownMenu({ trigger, children, align = "end", open, onOpenChange }: DropdownMenuProps) {
  return (
    <RadixDropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          sideOffset={6}
          className={cn("z-50 min-w-44 rounded-md border border-border-subtle bg-bg-surface p-2 shadow-md")}
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
  icon,
}: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        `flex cursor-pointer select-none items-center gap-2 rounded-sm p-2  text-sm outline-none transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-50 ${destructive ? "text-text-error hover:bg-bg-error-subtle focus:bg-bg-error-subtle" : "text-text-primary hover:bg-bg-surface-hover focus:bg-bg-surface-hover"}`,
      )}
    >
      {icon && <span aria-hidden>{icon}</span>}
      <span className={cn("min-w-0 flex-1")}>{children}</span>
    </RadixDropdownMenu.Item>
  );
}

export function DropdownMenuSeparator() {
  return <RadixDropdownMenu.Separator className={cn("my-1 h-px bg-border-subtle")} />;
}

export function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <RadixDropdownMenu.Label className={cn("px-2 py-1.5 text-xs font-medium text-text-secondary", className)}>
      {children}
    </RadixDropdownMenu.Label>
  );
}

export function DropdownMenuGroup({ children }: DropdownMenuGroupProps) {
  return <RadixDropdownMenu.Group>{children}</RadixDropdownMenu.Group>;
}
