import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@ui/lib/cn";
import React from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string;
}

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  required = false,
  id,
  name,
  value,
}: SwitchProps) {
  return (
    <RadixSwitch.Root
      id={id}
      name={name}
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      required={required}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-bg-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "data-[state=checked]:bg-bg-brand",
      )}
    >
      <RadixSwitch.Thumb
        className={cn(
          "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform",
          "data-[state=checked]:translate-x-5",
        )}
      />
    </RadixSwitch.Root>
  );
}
