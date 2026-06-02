import type { ComponentRef, ReactNode, Ref } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@ui/lib/cn";

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  asChild?: boolean;
  leadingIcon?: ReactNode;
  ref?: Ref<ComponentRef<typeof RadixTabs.Trigger>>;
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  return (
    <RadixTabs.Root defaultValue={defaultValue} value={value} onValueChange={onValueChange} className={className}>
      {children}
    </RadixTabs.Root>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <RadixTabs.List
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-md border border-border-subtle bg-bg-surface p-1",
        className,
      )}
    >
      {children}
    </RadixTabs.List>
  );
}

export function TabsTrigger({ value, children, className, asChild, leadingIcon, ref, ...props }: TabsTriggerProps) {
  if (asChild) {
    return (
      <RadixTabs.Trigger
        ref={ref}
        value={value}
        asChild
        className={cn(
          "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0 data-[state=active]:bg-bg-brand-subtle data-[state=active]:text-text-brand",
          className,
        )}
        {...props}
      >
        {children}
      </RadixTabs.Trigger>
    );
  }

  return (
    <RadixTabs.Trigger
      ref={ref}
      value={value}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0 data-[state=active]:bg-bg-brand-subtle data-[state=active]:text-text-brand",
        className,
      )}
      {...props}
    >
      {leadingIcon && <span className={cn("mr-1.5 shrink-0")}>{leadingIcon}</span>}
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <RadixTabs.Content value={value} className={cn("focus-visible:outline-none", className)}>
      {children}
    </RadixTabs.Content>
  );
}
