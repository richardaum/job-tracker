import { Text } from "@ui/components/Typography/Text";
import { cn } from "@ui/lib/cn";
import { useMemo } from "react";

import { AnchoredCombobox } from "./AnchoredCombobox";

export interface ComboboxOption {
  label: string;
  value: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  /** User typing in the input (filter / free text). */
  onInputValueChange: (text: string) => void;
  /** Picking an option from the dropdown. */
  onValueChange: (option: ComboboxOption) => void;
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
  onInputValueChange,
  onValueChange,
  placeholder,
  disabled,
  size = "md",
  state = "default",
  id,
  autoComplete = "one-time-code",
}: ComboboxProps) {
  const selectedByStableValue = options.find((option) => option.value === value);
  const inputDisplayValue = selectedByStableValue?.label ?? value;

  const filteredOptions = useMemo(() => {
    if (!inputDisplayValue) return options;
    return options.filter((option) => option.label.toLowerCase().includes(inputDisplayValue.toLowerCase()));
  }, [options, inputDisplayValue]);

  return (
    <AnchoredCombobox.Root
      value={inputDisplayValue}
      onValueChange={onInputValueChange}
      hasItems={filteredOptions.length > 0}
      disabled={disabled}
    >
      <AnchoredCombobox.Input placeholder={placeholder} size={size} state={state} id={id} autoComplete={autoComplete} />
      <AnchoredCombobox.Portal>
        <AnchoredCombobox.Content className={cn("z-50 p-1")}>
          <AnchoredCombobox.List className={cn("gap-2")}>
            {filteredOptions.map((option) => (
              <AnchoredCombobox.Item
                key={option.value}
                textValue={option.label}
                onSelect={() => {
                  onValueChange(option);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-left outline-none hover:bg-bg-surface-hover data-highlighted:bg-bg-surface-hover",
                )}
              >
                <Text size="sm">{option.label}</Text>
              </AnchoredCombobox.Item>
            ))}
          </AnchoredCombobox.List>
        </AnchoredCombobox.Content>
      </AnchoredCombobox.Portal>
    </AnchoredCombobox.Root>
  );
}
