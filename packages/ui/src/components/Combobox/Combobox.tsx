import React, { useState, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Input } from "../Input/Input";
import { Stack } from "../Stack/Stack";
import { Text } from "../Typography/Text";
import { cn } from "@ui/lib/cn";

export interface ComboboxOption {
  label: string;
  value: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  state?: "default" | "error";
  id?: string;
  autoComplete?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  size = "md",
  state = "default",
  id,
  autoComplete = "one-time-code",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!value) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(value.toLowerCase()),
    );
  }, [options, value]);

  const hasOptions = filteredOptions.length > 0;

  return (
    <Popover.Root open={open && hasOptions} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <Input
          id={id}
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (hasOptions) setOpen(true);
          }}
          onClick={() => {
            if (hasOptions && !open) setOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          state={state}
          autoComplete={autoComplete}
        />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (e.target === inputRef.current) {
              e.preventDefault();
            }
          }}
          className={cn(
            "z-50 min-w-(--radix-popover-anchor-width) max-h-60 overflow-auto rounded-md border border-border-subtle bg-bg-surface p-1 shadow-md",
          )}
        >
          <Stack gap="xs">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.label);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-left text-sm text-text-primary outline-none hover:bg-bg-surface-hover focus:bg-bg-surface-hover",
                )}
              >
                <Text size="sm">{option.label}</Text>
              </button>
            ))}
          </Stack>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
