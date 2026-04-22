import React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import * as RadixSelect from "@radix-ui/react-select";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  size?: "sm" | "md";
  state?: "default" | "error";
}

const sizeClasses: Record<NonNullable<SelectProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
};

const stateClasses: Record<NonNullable<SelectProps["state"]>, string> = {
  default:
    "border-border-default focus-visible:border-border-brand focus-visible:ring-border-brand",
  error:
    "border-border-error text-text-error focus-visible:border-border-error focus-visible:ring-border-error",
};

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  name,
  required = false,
  size = "md",
  state = "default",
}: SelectProps) {
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      <RadixSelect.Trigger
        aria-label={placeholder}
        className={`inline-flex w-full items-center justify-between rounded-md border bg-bg-surface text-left text-text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-bg-surface-hover ${sizeClasses[size]} ${stateClasses[state]}`}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="ml-2 text-text-muted">
          <CaretDownIcon size={16} weight="regular" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          className="z-50 min-w-(--radix-select-trigger-width) rounded-md border border-border-subtle bg-bg-surface p-1 shadow-md"
        >
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm text-text-primary outline-none hover:bg-bg-surface-hover focus:bg-bg-surface-hover data-[state=checked]:bg-bg-brand-subtle data-[state=checked]:text-text-brand"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
